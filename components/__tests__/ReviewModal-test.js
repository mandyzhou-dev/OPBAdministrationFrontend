import * as React from "react";
import renderer from "react-test-renderer";

const mockPermitReview = jest.fn();
const mockRejectReview = jest.fn();

jest.mock("@/service/ApplicationService", () => ({
  permitReview: (...args) => mockPermitReview(...args),
  rejectReview: (...args) => mockRejectReview(...args),
}));

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    BadgeText: createPrimitive("BadgeText"),
    Button: createPrimitive("Button"),
    ButtonText: createPrimitive("ButtonText"),
    CloseIcon: "CloseIcon",
    FormControl: createPrimitive("FormControl"),
    FormControlLabel: createPrimitive("FormControlLabel"),
    FormControlLabelText: createPrimitive("FormControlLabelText"),
    Heading: createPrimitive("Heading"),
    HStack: createPrimitive("HStack"),
    Icon: createPrimitive("Icon"),
    Modal: createPrimitive("Modal"),
    ModalBackdrop: createPrimitive("ModalBackdrop"),
    ModalBody: createPrimitive("ModalBody"),
    ModalCloseButton: createPrimitive("ModalCloseButton"),
    ModalContent: createPrimitive("ModalContent"),
    ModalFooter: createPrimitive("ModalFooter"),
    ModalHeader: createPrimitive("ModalHeader"),
    Text: createPrimitive("Text"),
    Textarea: createPrimitive("Textarea"),
    TextareaInput: createPrimitive("TextareaInput"),
    VStack: createPrimitive("VStack"),
    View: createPrimitive("View"),
  };
});

const baseApplication = {
  id: 42,
  applicant: "Harsimranjit Kaur ",
  leaveType: "SICK",
  status: "pending",
  reason: "Need leave",
};

const collectText = (node) => {
  if (node == null || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(collectText).join(" ");
  }
  return collectText(node.children);
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const renderModal = (props = {}) => {
  const { ReviewModal } = require("../applications/ReviewModal");
  let component;
  renderer.act(() => {
    component = renderer.create(
      <ReviewModal
        currentApplication={{ ...baseApplication, ...props.currentApplication }}
        showModal={props.showModal ?? true}
        setShowModal={props.setShowModal ?? jest.fn()}
        onClose={props.onClose ?? jest.fn()}
      />
    );
  });
  return component;
};

const findButton = (root, label) =>
  root.findAllByType("Button").find((button) => collectText(button).includes(label));

describe("ReviewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermitReview.mockResolvedValue({});
    mockRejectReview.mockResolvedValue({});
  });

  it("approves with an optional review comment and closes only after success", async () => {
    const pending = deferred();
    mockPermitReview.mockReturnValueOnce(pending.promise);
    const onClose = jest.fn();
    const component = renderModal({ onClose });

    renderer.act(() => {
      component.root.findByType("TextareaInput").props.onChangeText("  conditional approval  ");
    });
    let submitPromise;
    renderer.act(() => {
      submitPromise = findButton(component.root, "Approve").props.onPress();
    });

    expect(mockPermitReview).toHaveBeenCalledWith(42, "conditional approval");
    const buttons = component.root.findAllByType("Button");
    expect(buttons[0].props.isDisabled).toBe(true);
    expect(buttons[1].props.isDisabled).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    await renderer.act(async () => {
      pending.resolve({});
      await submitPromise;
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sends no approve comment for whitespace-only input", async () => {
    const component = renderModal();

    renderer.act(() => {
      component.root.findByType("TextareaInput").props.onChangeText("   ");
    });
    await renderer.act(async () => {
      await findButton(component.root, "Approve").props.onPress();
    });

    expect(mockPermitReview).toHaveBeenCalledWith(42, undefined);
  });

  it("blocks blank decline comments after trimming", () => {
    const onClose = jest.fn();
    const component = renderModal({ onClose });

    renderer.act(() => {
      component.root.findByType("TextareaInput").props.onChangeText("   ");
    });
    renderer.act(() => {
      findButton(component.root, "Decline").props.onPress();
    });

    expect(mockRejectReview).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(collectText(component.toJSON())).toContain("Review comment is required for declined applications.");
  });

  it("keeps the modal open and preserves the comment when a request fails", async () => {
    mockRejectReview.mockRejectedValueOnce(new Error("network"));
    const onClose = jest.fn();
    const component = renderModal({ onClose });

    renderer.act(() => {
      component.root.findByType("TextareaInput").props.onChangeText("Needs more detail");
    });
    await renderer.act(async () => {
      await findButton(component.root, "Decline").props.onPress();
    });

    expect(mockRejectReview).toHaveBeenCalledWith(42, "Needs more detail");
    expect(onClose).not.toHaveBeenCalled();
    expect(component.root.findByType("TextareaInput").props.value).toBe("Needs more detail");
    expect(collectText(component.toJSON())).toContain("Review failed. Please try again.");
  });
});
