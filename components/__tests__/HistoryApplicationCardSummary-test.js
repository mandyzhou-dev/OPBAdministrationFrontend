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

jest.mock("react-native-paper", () => ({
  TextInput: () => null,
}));

jest.mock("react-native-paper/lib/typescript/core/settings", () => ({}), { virtual: true });

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

const longText =
  "This is a long application history comment that should stay readable in full details but must not stretch the card height in the history grid.";

const baseApplication = {
  id: 7,
  applicant: "worker1",
  start: "2026-05-01T09:00:00Z",
  end: "2026-05-01T17:00:00Z",
  leaveType: "SICK",
  status: "approved",
  reason: longText,
  rejectReason: longText,
  note: longText,
};

const findAllByType = (node, type) => {
  if (!node) {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => findAllByType(child, type));
  }
  const matches = node.type === type ? [node] : [];
  const children = Array.isArray(node.children) ? node.children : [];
  return matches.concat(children.flatMap((child) => findAllByType(child, type)));
};

describe("HistoryApplicationCard summaries", () => {
  it("keeps history cards compact and clamps supporting text with a full-detail entry", () => {
    const { HistoryApplicationCard } = require("../applications/HistoryApplicationCard");

    const tree = renderer.create(<HistoryApplicationCard application={baseApplication} />).toJSON();
    const card = findAllByType(tree, "Card")[0];
    const texts = findAllByType(tree, "Text");
    const buttons = findAllByType(tree, "Button");
    const icons = findAllByType(tree, "MaterialIcons");

    expect(card.props.height).toBeUndefined();
    expect(card.props.minHeight).toBeLessThanOrEqual(360);
    expect(card.props.maxWidth).toBeDefined();
    expect(texts.filter((text) => text.props.numberOfLines === 2)).toHaveLength(2);
    expect(texts.filter((text) => text.props.numberOfLines === 3)).toHaveLength(1);
    expect(texts.filter((text) => text.props.ellipsizeMode === "tail")).toHaveLength(3);
    expect(buttons.some((button) => button.children?.some((child) => child.children?.includes("View record")))).toBe(false);
    expect(icons.some((icon) => icon.props.name === "edit" && icon.props.size <= 14)).toBe(true);
  });

  it("uses the top info icon as the only accessible record details trigger", () => {
    const { HistoryApplicationCard } = require("../applications/HistoryApplicationCard");

    let testRenderer;
    renderer.act(() => {
      testRenderer = renderer.create(<HistoryApplicationCard application={baseApplication} />);
    });

    const root = testRenderer.root;
    const detailTrigger = root.find(
      (node) =>
        node.type === "Pressable" &&
        node.props.accessibilityLabel === "View record details"
    );

    expect(detailTrigger.props.role).toBe("button");
    expect(detailTrigger.props.tabIndex).toBe(0);
    expect(detailTrigger.props.minHeight).toBeGreaterThanOrEqual(32);
    expect(detailTrigger.props.minWidth).toBeGreaterThanOrEqual(32);
    expect(root.findAllByProps({ children: "View record" })).toHaveLength(0);
    expect(root.findAllByProps({ children: "View record details" }).length).toBeGreaterThan(0);

    renderer.act(() => {
      detailTrigger.props.onPress();
    });

    expect(root.findByType("Modal").props.isOpen).toBe(true);
  });
});
