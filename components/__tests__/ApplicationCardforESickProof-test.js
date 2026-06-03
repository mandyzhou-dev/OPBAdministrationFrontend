import * as React from "react";
import renderer, { act } from "react-test-renderer";

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
  status: "pending",
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

const collectPropValues = (node, propName) => {
  if (node == null || typeof node === "boolean" || typeof node === "string" || typeof node === "number") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectPropValues(child, propName));
  }
  return [
    node.props?.[propName],
    ...collectPropValues(node.children, propName),
  ].filter((value) => value !== undefined);
};

const renderCard = (application, props = {}) => {
  const { ApplicationCardforE } = require("../applications/ApplicationCardforE");
  return renderer.create(
    <ApplicationCardforE
      application={{ ...baseApplication, ...application }}
      deleteApplication={jest.fn()}
      uploadSickProof={jest.fn().mockResolvedValue({})}
      {...props}
    />
  );
};

describe("ApplicationCardforE sick proof", () => {
  it("shows a required proof prompt and compact upload action for unsubmitted sick leave", () => {
    const component = renderCard({ sickProofRequired: true, sickProofSubmitted: false });
    const text = collectText(component.toJSON());
    const strip = component.root.findByProps({ "data-testid": "sick-proof-strip" });
    const button = component.root.findByProps({ "data-testid": "sick-proof-upload-button" });

    expect(text).toContain("Proof required");
    expect(text).toContain("Please upload your sick leave proof.");
    expect(text).toContain("PDF or image files up to 10 MB.");
    expect(text).toContain("Upload proof");
    expect(strip.props.style.backgroundColor).toBe("#FFFBEB");
    expect(button.props.variant).toBe("outline");
  });

  it("shows submitted state and keeps reupload available", () => {
    const component = renderCard({
      sickProofRequired: true,
      sickProofSubmitted: true,
      sickProofOriginalFilename: "doctor-note.pdf",
    });
    const text = collectText(component.toJSON());
    const strip = component.root.findByProps({ "data-testid": "sick-proof-strip" });

    expect(text).toContain("Proof submitted");
    expect(text).toContain("Proof uploaded. You can upload again if needed.");
    expect(text).toContain("doctor-note.pdf");
    expect(text).toContain("Upload again");
    expect(strip.props.style.backgroundColor).toBe("#F0FDF4");
  });

  it("submits valid selected files through the upload callback", async () => {
    const uploadSickProof = jest.fn().mockResolvedValue({});
    const file = { name: "proof.png", type: "image/png", size: 2048 };
    const component = renderCard(
      { sickProofRequired: true, sickProofSubmitted: false },
      { uploadSickProof }
    );

    await act(async () => {
      component.root.findByProps({ "data-testid": "sick-proof-file-input" }).props.onChange({
        target: { files: [file], value: "proof.png" },
      });
      await Promise.resolve();
    });

    expect(uploadSickProof).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }), file);
  });

  it("rejects unsupported files inline before upload", async () => {
    const uploadSickProof = jest.fn().mockResolvedValue({});
    const file = { name: "proof.exe", type: "application/octet-stream", size: 2048 };
    const component = renderCard(
      { sickProofRequired: true, sickProofSubmitted: false },
      { uploadSickProof }
    );

    await act(async () => {
      component.root.findByProps({ "data-testid": "sick-proof-file-input" }).props.onChange({
        target: { files: [file], value: "proof.exe" },
      });
      await Promise.resolve();
    });

    expect(uploadSickProof).not.toHaveBeenCalled();
    expect(collectText(component.toJSON())).toContain("Please upload a PDF or image file.");
  });

  it("uses web-safe data-testid selectors instead of leaking React Native testID props", () => {
    const component = renderCard({ sickProofRequired: true, sickProofSubmitted: false });
    const tree = component.toJSON();

    expect(collectPropValues(tree, "testID")).toEqual([]);
    expect(collectPropValues(tree, "data-testid")).toEqual(
      expect.arrayContaining([
        "sick-proof-strip",
        "sick-proof-upload-button",
        "sick-proof-file-input",
        "employee-application-card-footer",
      ])
    );
  });
});
