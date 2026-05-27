import * as React from "react";
import renderer, { act } from "react-test-renderer";

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
}));

jest.mock("@/request/LeaveApplicationRequest", () => ({
  LeaveApplicationRequest: jest.fn().mockImplementation(() => ({
    getLeaveDateAvailability: jest.fn(() =>
      Promise.resolve({
        dates: [],
      })
    ),
    putLeaveApplication: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("antd", () => {
  const React = require("react");

  const DatePicker = ({ value, onChange, disabledDate, style }) =>
    React.createElement("DatePicker", { value, onChange, disabledDate, style });
  DatePicker.RangePicker = ({ value, onChange, disabledDate, style }) =>
    React.createElement("RangePicker", { value, onChange, disabledDate, style });

  return {
    DatePicker,
    Flex: ({ children, ...props }) => React.createElement("Flex", props, children),
  };
});

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    Alert: createPrimitive("Alert"),
    AlertIcon: createPrimitive("AlertIcon"),
    AlertText: createPrimitive("AlertText"),
    Button: createPrimitive("Button"),
    ButtonText: createPrimitive("ButtonText"),
    Card: createPrimitive("Card"),
    FormControl: createPrimitive("FormControl"),
    FormControlLabel: createPrimitive("FormControlLabel"),
    FormControlLabelText: createPrimitive("FormControlLabelText"),
    InfoIcon: "InfoIcon",
    Input: createPrimitive("Input"),
    InputField: createPrimitive("InputField"),
    ScrollView: createPrimitive("ScrollView"),
    Text: createPrimitive("Text"),
    Textarea: createPrimitive("Textarea"),
    TextareaInput: createPrimitive("TextareaInput"),
  };
});

jest.mock("@/components/FreeStyle/RequiredFormControl", () => {
  const React = require("react");

  return {
    RequiredFormControl: ({ title, helper, onUpdate }) =>
      React.createElement(
        "RequiredFormControl",
        { title, onUpdate },
        title,
        helper ? React.createElement("HelperText", null, helper) : null
      ),
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

describe("NewApplication helper text layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage = {
      getItem: jest.fn(() =>
        JSON.stringify({
          username: "employee1",
        })
      ),
    };
  });

  it("renders sick leave availability and time format as field helper text", async () => {
    const NewApplication = require("../../app/applications/NewApplication").default;
    let component;

    await act(async () => {
      component = renderer.create(<NewApplication />);
    });

    const leaveTypeControl = component.root
      .findAllByType("RequiredFormControl")
      .find((control) => control.props.title === "Leave Type");

    await act(async () => {
      leaveTypeControl.props.onUpdate("SICK");
      await Promise.resolve();
    });

    const cards = component.root.findAllByType("Card");
    const dayCard = cards.find((card) => collectText(card).includes("Day"));
    const sickHelperText = "Sick leave dates require an existing scheduled shift.";

    expect(collectText(dayCard)).toContain(sickHelperText);
    expect(collectText(dayCard)).toContain("Format: HHmm-HHmm");
    expect(collectText(dayCard)).toContain("Time");
    expect(collectText(dayCard)).not.toContain("Time(Format:HHmm-HHmm)");

    expect(
      cards.some((card) => collectText(card).trim() === sickHelperText)
    ).toBe(false);

    const sickHelper = component.root
      .findAllByType("Text")
      .find((text) => collectText(text).trim() === sickHelperText);

    expect(sickHelper.props.style).toEqual(
      expect.objectContaining({
        color: "#8c8c8c",
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 12,
      })
    );
  });
});
