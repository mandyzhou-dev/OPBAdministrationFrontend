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
    Card: createPrimitive("Card"),
    CircleIcon: "CircleIcon",
    Heading: createPrimitive("Heading"),
    HStack: createPrimitive("HStack"),
    InfoIcon: "InfoIcon",
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

describe("ReviewOfApplicationCard proof status", () => {
  it("shows missing proof on sick leave and adds the review-page accent", () => {
    const { ReviewOfApplicationCard } = require("../applications/ReviewOfApplicationCard");

    const component = renderer.create(
      <ReviewOfApplicationCard
        application={{
          id: 1,
          applicant: "worker1",
          leaveType: "SICK",
          start: "2026-06-03T09:00:00Z",
          end: "2026-06-03T17:00:00Z",
          reason: "Need sick leave",
          sickProofRequired: true,
          sickProofSubmitted: false,
        }}
        onClick={jest.fn()}
      />
    );
    const card = component.root.findByProps({ "data-testid": "review-application-card" });

    expect(collectText(component.toJSON())).toContain("Proof missing");
    expect(card.props.borderLeftWidth).toBe(3);
    expect(card.props.borderLeftColor).toBe("#F59E0B");
  });

  it("does not add proof noise to non-sick cards", () => {
    const { ReviewOfApplicationCard } = require("../applications/ReviewOfApplicationCard");

    const component = renderer.create(
      <ReviewOfApplicationCard
        application={{
          id: 2,
          applicant: "worker2",
          leaveType: "VACATION",
          start: "2026-06-03T09:00:00Z",
          end: "2026-06-03T17:00:00Z",
          reason: "Vacation",
          sickProofRequired: false,
        }}
        onClick={jest.fn()}
      />
    );

    expect(collectText(component.toJSON())).not.toContain("Proof not required");
  });
});
