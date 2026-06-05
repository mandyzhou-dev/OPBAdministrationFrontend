import * as React from "react";
import renderer from "react-test-renderer";

jest.mock("@/service/ApplicationService", () => ({
  addNote: jest.fn(() => Promise.resolve({})),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: ({ name, size }) => {
    const React = require("react");
    return React.createElement("MaterialIcons", { name, size });
  },
}));

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
    Textarea: createPrimitive("Textarea"),
    TextareaInput: createPrimitive("TextareaInput"),
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

describe("HistoryApplicationCard proof status", () => {
  it("shows submitted proof status and audit metadata without a review accent", () => {
    const { HistoryApplicationCard } = require("../applications/HistoryApplicationCard");

    const component = renderer.create(
      <HistoryApplicationCard
        application={{
          id: 3,
          applicant: "worker3",
          leaveType: "SICK",
          start: "2026-06-03T09:00:00Z",
          end: "2026-06-03T17:00:00Z",
          status: "approved",
          reason: "Sick leave",
          sickProofRequired: true,
          sickProofSubmitted: true,
          sickProofUploadedAt: "2026-06-03T21:14:00Z",
          sickProofOriginalFilename: "doctor-note.pdf",
        }}
      />
    );
    const card = component.root.findByType("Card");
    const text = collectText(component.toJSON());

    expect(text).toContain("Proof submitted");
    expect(text).toContain("Uploaded Jun 3");
    expect(text).toContain("doctor-note.pdf");
    expect(card.props.borderLeftWidth).toBeUndefined();
  });

  it("shows proof summary before comment details in history modal content", () => {
    const { HistoryApplicationCard } = require("../applications/HistoryApplicationCard");

    const component = renderer.create(
      <HistoryApplicationCard
        application={{
          id: 4,
          applicant: "worker4",
          leaveType: "SICK",
          start: "2026-06-03T09:00:00Z",
          end: "2026-06-03T17:00:00Z",
          status: "approved",
          reason: "Needs leave",
          sickProofRequired: true,
          sickProofSubmitted: false,
        }}
      />
    );
    const text = collectText(component.toJSON());

    expect(text.indexOf("Proof missing")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("Proof missing")).toBeLessThan(text.indexOf("Comment"));
    expect(text).toContain("No file uploaded yet");
  });
});
