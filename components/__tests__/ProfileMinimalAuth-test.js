import React from "react";
import renderer from "react-test-renderer";
import { Profile } from "@/components/Profile";

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    Button: createPrimitive("Button"),
    ButtonText: createPrimitive("ButtonText"),
    Card: createPrimitive("Card"),
    Center: createPrimitive("Center"),
    HStack: createPrimitive("HStack"),
    Pressable: createPrimitive("Pressable"),
    Text: createPrimitive("Text"),
    View: createPrimitive("View"),
    VStack: createPrimitive("VStack"),
  };
});

jest.mock("@mui/material/TextField", () => {
  const React = require("react");
  return ({ label, defaultValue, ...props }) =>
    React.createElement("TextField", props, [label, defaultValue].filter(Boolean));
});

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
}));

describe("Profile with minimal login state", () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: jest.fn(() => JSON.stringify({
        username: "employee1",
        name: "Employee One",
        roles: "tester",
        groupName: "surrey",
        jsessionID: "session-123",
        token: "jwt-token",
      })),
      removeItem: jest.fn(),
    };
    global.window = { location: { reload: jest.fn() } };
  });

  it("renders safe account fields and does not render empty privacy inputs from login state", () => {
    const tree = renderer.create(<Profile />).toJSON();
    const serialized = JSON.stringify(tree);

    expect(serialized).toContain("Employee One");
    expect(serialized).toContain("employee1");
    expect(serialized).not.toContain("Invalid date");
    expect(serialized).not.toContain("Email");
    expect(serialized).not.toContain("Birthdate");
    expect(serialized).not.toContain("PhoneNumber");
    expect(serialized).not.toContain("Address");
  });
});
