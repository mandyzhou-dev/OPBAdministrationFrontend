import * as React from "react";
import renderer from "react-test-renderer";

import { ShiftCell } from "../shift/ShiftCell";
import { User } from "@/model/User";
import { Shift } from "@/model/Shift";

jest.mock("@/util/useAuth", () => ({
  useAuth: () => ({ canEdit: false }),
}));

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    Badge: createPrimitive("Badge"),
    BadgeText: createPrimitive("BadgeText"),
    BadgeIcon: createPrimitive("BadgeIcon"),
    VStack: createPrimitive("VStack"),
    HStack: createPrimitive("HStack"),
    InfoIcon: "InfoIcon",
  };
});

jest.mock("../shift/ShiftDetailModal", () => ({
  ShiftDetailModal: () => null,
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

describe("ShiftCell status detail display", () => {
  it.each([
    ["paid_sick_leave", "Paid sick leave"],
    ["unpaid_sick_leave", "Unpaid sick leave"],
    ["no_show", "No show"],
  ])("renders %s status detail inside the shift cell", (status, label) => {
    const worker = new User("worker-1", "Worker One", undefined, undefined, undefined, undefined, undefined, undefined, undefined, "surrey");
    const shift = new Shift();
    shift.username = "worker-1";
    shift.start = new Date("2026-05-14T09:00:00");
    shift.end = new Date("2026-05-14T17:00:00");
    shift.status = status;

    const tree = renderer
      .create(
        <ShiftCell
          workers={[worker]}
          shifts={new Map([["worker-1", shift]])}
          onUpdated={jest.fn()}
        />
      )
      .toJSON();

    expect(collectText(tree)).toContain(label);
  });
});
