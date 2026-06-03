import * as React from "react";
import renderer from "react-test-renderer";

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    BadgeIcon: createPrimitive("BadgeIcon"),
    BadgeText: createPrimitive("BadgeText"),
    Button: createPrimitive("Button"),
    ButtonText: createPrimitive("ButtonText"),
    Card: createPrimitive("Card"),
    CheckIcon: "CheckIcon",
    CircleIcon: "CircleIcon",
    CloseIcon: "CloseIcon",
    Heading: createPrimitive("Heading"),
    HStack: createPrimitive("HStack"),
    Icon: createPrimitive("Icon"),
    InfoIcon: "InfoIcon",
    Modal: createPrimitive("Modal"),
    ModalBackdrop: createPrimitive("ModalBackdrop"),
    ModalBody: createPrimitive("ModalBody"),
    ModalCloseButton: createPrimitive("ModalCloseButton"),
    ModalContent: createPrimitive("ModalContent"),
    ModalFooter: createPrimitive("ModalFooter"),
    ModalHeader: createPrimitive("ModalHeader"),
    Pressable: createPrimitive("Pressable"),
    ScrollView: createPrimitive("ScrollView"),
    Text: createPrimitive("Text"),
    Tooltip: ({ children, trigger, ...props }) =>
      React.createElement("Tooltip", props, [
        trigger ? React.createElement(React.Fragment, { key: "trigger" }, trigger({})) : null,
        React.createElement(React.Fragment, { key: "content" }, children),
      ]),
    TooltipContent: createPrimitive("TooltipContent"),
    TooltipText: createPrimitive("TooltipText"),
    VStack: createPrimitive("VStack"),
  };
});

const baseApplication = {
  id: 42,
  applicant: "worker1",
  start: "2026-05-01T09:00:00Z",
  end: "2026-05-01T17:00:00Z",
  leaveType: "SICK",
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

const renderCard = (application) => {
  const { ApplicationCardforE } = require("../applications/ApplicationCardforE");
  return renderer.create(
    <ApplicationCardforE application={{ ...baseApplication, ...application }} deleteApplication={jest.fn()} />
  );
};

describe("ApplicationCardforE delete visibility", () => {
  it.each(["pending", "draft", " Pending "])(
    "shows a compact Delete action for deletable status %s",
    (status) => {
      const component = renderCard({ status });
      const deleteButtons = component.root
        .findAllByType("Button")
        .filter((button) => button.props.action === "negative");

      expect(collectText(component.toJSON())).toContain("Delete");
      expect(collectText(component.toJSON())).not.toContain("Delete Application");
      expect(deleteButtons).toHaveLength(1);
      expect(deleteButtons[0].props.height).toBe(32);
      expect(deleteButtons[0].props.variant).toBe("link");
    }
  );

  it.each([
    ["approved", "Approved applications can't be deleted."],
    ["rejected", "Rejected applications can't be deleted."],
    ["cancelled", "Cancelled applications can't be deleted."],
    ["unknown", "This application can't be deleted."],
    [null, "This application can't be deleted."],
    [undefined, "This application can't be deleted."],
  ])("replaces Delete Application with an explanation for status %s", (status, message) => {
    const component = renderCard({ status });

    expect(
      component.root.findAllByType("Button").filter((button) => button.props.action === "negative")
    ).toHaveLength(0);
    expect(collectText(component.toJSON())).toContain(message);
    expect(collectText(component.toJSON())).not.toContain("Delete Application");
  });

  it("uses backend canDelete when present", () => {
    const forcedDeletable = renderCard({ status: "approved", canDelete: true });
    const forcedLocked = renderCard({ status: "pending", canDelete: false });

    expect(collectText(forcedDeletable.toJSON())).toContain("Delete");
    expect(collectText(forcedDeletable.toJSON())).not.toContain("Delete Application");
    expect(collectText(forcedLocked.toJSON())).toContain("Pending applications can't be deleted.");
    expect(
      forcedLocked.root.findAllByType("Button").filter((button) => button.props.action === "negative")
    ).toHaveLength(0);
  });

  it("allows the unavailable explanation to wrap instead of relying on a tooltip", () => {
    const component = renderCard({ status: "approved" });
    const explanation = component.root
      .findAllByType("Text")
      .find((text) => collectText(text).trim() === "Approved applications can't be deleted.");

    expect(explanation.props.flexWrap).toBe("wrap");
  });

  it("keeps the employee card compact with a summary and footer action area", () => {
    const component = renderCard({
      status: "approved",
      reason:
        "This is a long employee comment that should be summarized on the card and moved into the details modal for full reading.",
    });
    const card = component.root.findByType("Card");
    const summaryText = component.root
      .findAllByType("Text")
      .find((text) => collectText(text).includes("This is a long employee comment"));
    const footer = component.root.findByProps({ "data-testid": "employee-application-card-footer" });

    expect(card.props.width).toBe("100%");
    expect(card.props.maxWidth).toBe(350);
    expect(card.props.minHeight).toBeLessThanOrEqual(260);
    expect(summaryText.props.numberOfLines).toBe(2);
    expect(summaryText.props.ellipsizeMode).toBe("tail");
    expect(footer.props.marginTop).toBe("auto");
    expect(footer.props.borderTopWidth).toBe(1);
  });

  it("opens application details from a visible lightweight Details trigger", () => {
    let component;
    renderer.act(() => {
      component = renderCard({
        status: "rejected",
        reason: "Full employee comment",
        rejectReason: "Manager reject reason",
      });
    });

    const root = component.root;
    const detailTrigger = root.find(
      (node) =>
        node.type === "Pressable" &&
        node.props.accessibilityLabel === "View application details"
    );

    expect(detailTrigger.props.minHeight).toBeGreaterThanOrEqual(32);
    expect(detailTrigger.props.minWidth).toBeGreaterThanOrEqual(32);
    expect(collectText(detailTrigger)).toContain("Details");
    expect(detailTrigger.props.bg).toBe("transparent");
    expect(root.findByType("Modal").props.isOpen).toBe(false);

    renderer.act(() => {
      detailTrigger.props.onPress();
    });

    expect(root.findByType("Modal").props.isOpen).toBe(true);
    expect(collectText(component.toJSON())).toContain("Application Details");
    expect(collectText(component.toJSON())).toContain("Manager reject reason");
  });

  it("makes the Details trigger stronger when hidden detail content exists", () => {
    const component = renderCard({
      status: "approved",
      reason: "Short comment",
      rejectReason: "Manager explanation hidden in details",
    });
    const detailLabel = component.root
      .findAllByType("Text")
      .find((text) => collectText(text).trim() === "Details");

    expect(detailLabel.props.fontWeight).toBe("$semibold");
    expect(detailLabel.props.color).toBe("$textLight800");
  });
});
