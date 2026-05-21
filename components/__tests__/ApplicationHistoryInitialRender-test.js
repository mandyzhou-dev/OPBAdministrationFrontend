import * as React from "react";
import renderer from "react-test-renderer";

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
}));

jest.mock("@/service/ApplicationService", () => ({
  getApplicationHistory: jest.fn(() => new Promise(() => {})),
}));

jest.mock("@/service/UserService", () => ({
  getEmployeeOptions: jest.fn(() => new Promise(() => {})),
}));

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    Button: createPrimitive("Button"),
    ButtonText: createPrimitive("ButtonText"),
    Card: createPrimitive("Card"),
    ChevronDownIcon: "ChevronDownIcon",
    HStack: createPrimitive("HStack"),
    ScrollView: createPrimitive("ScrollView"),
    Select: createPrimitive("Select"),
    SelectBackdrop: createPrimitive("SelectBackdrop"),
    SelectContent: createPrimitive("SelectContent"),
    SelectDragIndicator: createPrimitive("SelectDragIndicator"),
    SelectDragIndicatorWrapper: createPrimitive("SelectDragIndicatorWrapper"),
    SelectIcon: createPrimitive("SelectIcon"),
    SelectInput: createPrimitive("SelectInput"),
    SelectItem: ({ label }) => React.createElement("SelectItem", null, label),
    SelectPortal: createPrimitive("SelectPortal"),
    SelectTrigger: createPrimitive("SelectTrigger"),
    Spinner: createPrimitive("Spinner"),
    Text: createPrimitive("Text"),
    VStack: createPrimitive("VStack"),
    View: createPrimitive("View"),
  };
});

jest.mock("@/components/applications/HistoryApplicationCard", () => ({
  HistoryApplicationCard: () => null,
}));

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

describe("Application History initial render", () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: jest.fn(() =>
        JSON.stringify({
          username: "manager1",
          roles: "Manager",
        })
      ),
    };
  });

  it("keeps employee filter text hidden until the initial page load is ready", () => {
    const History = require("../../app/applications/History").default;

    const tree = renderer.create(<History />).toJSON();
    const text = collectText(tree);

    expect(text).toContain("Loading history...");
    expect(text).not.toContain("Employee");
    expect(text).not.toContain("All employees");
  });

  it("keeps employee filter text hidden while initial requests are pending", async () => {
    const History = require("../../app/applications/History").default;
    let component;

    await renderer.act(async () => {
      component = renderer.create(<History />);
      await Promise.resolve();
    });

    const text = collectText(component.toJSON());

    expect(text).toContain("Loading history...");
    expect(text).not.toContain("Employee");
    expect(text).not.toContain("All employees");
  });
});
