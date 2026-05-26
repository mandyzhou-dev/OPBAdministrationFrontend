import dayjs from "dayjs";
import * as React from "react";
import renderer, { act } from "react-test-renderer";

import {
  buildHolidayWarningText,
  getStatutoryHolidaySkippedDetails,
  getTargetWeekHolidays,
  groupSkippedDetailsByTargetDate,
} from "@/components/shift/CopyDialogModalState";
import { CopyDialogModal } from "@/components/shift/CopyDialogModal";
import { copyWeekScheduleTo } from "@/service/ShiftService";
import { getStatutoryHoliday } from "@/service/StatutoryHolidayService";

jest.mock("@/service/ShiftService", () => ({
  copyWeekScheduleTo: jest.fn(),
}));

jest.mock("@/service/StatutoryHolidayService", () => ({
  getStatutoryHoliday: jest.fn(),
}));

jest.mock("antd", () => {
  const React = require("react");

  return {
    DatePicker: ({ value, onChange, disabledDate }) =>
      React.createElement("DatePicker", { value, onChange, disabledDate }),
    Flex: ({ children, ...props }) => React.createElement("Flex", props, children),
  };
});

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    Button: createPrimitive("Button"),
    Text: createPrimitive("Text"),
    ButtonText: createPrimitive("ButtonText"),
    Modal: createPrimitive("Modal"),
    ModalBackdrop: createPrimitive("ModalBackdrop"),
    ModalContent: createPrimitive("ModalContent"),
    Card: createPrimitive("Card"),
    HStack: createPrimitive("HStack"),
    RadioGroup: createPrimitive("RadioGroup"),
    RadioIndicator: createPrimitive("RadioIndicator"),
    RadioIcon: createPrimitive("RadioIcon"),
    CircleIcon: "CircleIcon",
    RadioLabel: createPrimitive("RadioLabel"),
    Radio: createPrimitive("Radio"),
    Heading: createPrimitive("Heading"),
    ModalHeader: createPrimitive("ModalHeader"),
    ModalCloseButton: createPrimitive("ModalCloseButton"),
    Icon: createPrimitive("Icon"),
    CloseIcon: "CloseIcon",
    ModalFooter: createPrimitive("ModalFooter"),
    ModalBody: createPrimitive("ModalBody"),
    Toast: createPrimitive("Toast"),
    ToastTitle: createPrimitive("ToastTitle"),
    ToastDescription: createPrimitive("ToastDescription"),
    VStack: createPrimitive("VStack"),
    Alert: createPrimitive("Alert"),
    AlertIcon: createPrimitive("AlertIcon"),
    InfoIcon: "InfoIcon",
    AlertText: createPrimitive("AlertText"),
    Spinner: createPrimitive("Spinner"),
    useToast: () => ({
      isActive: jest.fn(() => false),
      show: jest.fn(),
    }),
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

const renderCopyDialog = (setShowModal = jest.fn()) =>
  renderer.create(
    <CopyDialogModal
      srcWeekStart={dayjs("2026-05-17")}
      showModal={true}
      setShowModal={setShowModal}
      onClose={jest.fn()}
    />
  );

describe("CopyDialogModal statutory holiday state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getStatutoryHoliday.mockResolvedValue([]);
  });

  it("finds target-week holidays by YYYY-MM-DD string and builds name/date warning text", () => {
    const holidays = [
      { holidayName: "Victoria Day", statutoryDate: "2026-05-18" },
      { holidayName: "Canada Day", statutoryDate: "2026-07-01" },
    ];

    const targetWeekHolidays = getTargetWeekHolidays(
      holidays,
      dayjs("2026-05-17")
    );

    expect(targetWeekHolidays).toEqual([
      { date: "2026-05-18", name: "Victoria Day" },
    ]);
    expect(buildHolidayWarningText(targetWeekHolidays)).toBe(
      "Target week includes statutory holiday(s): Victoria Day (2026-05-18). Copied shifts on those dates will be skipped."
    );
  });

  it("does not include holidays outside the selected target week", () => {
    const holidays = [
      { holidayName: "Victoria Day", statutoryDate: "2026-05-18" },
    ];

    expect(getTargetWeekHolidays(holidays, dayjs("2026-05-24"))).toEqual([]);
  });

  it("falls back to date-only warning copy when holiday name is missing", () => {
    const warning = buildHolidayWarningText([{ date: "2026-05-18" }]);

    expect(warning).toBe(
      "Target week includes statutory holiday(s): 2026-05-18. Copied shifts on those dates will be skipped."
    );
  });

  it("filters statutory-holiday skipped details and groups them by target date", () => {
    const details = getStatutoryHolidaySkippedDetails({
      skippedDetails: [
        {
          username: "alice",
          targetDate: "2026-05-25",
          reason: "STATUTORY_HOLIDAY",
        },
        {
          username: "bob",
          targetDate: "2026-05-25",
          reason: "STATUTORY_HOLIDAY",
        },
        {
          username: "casey",
          targetDate: "2026-05-26",
          reason: "SHIFT_ALREADY_EXISTS",
        },
      ],
    });

    expect(details).toHaveLength(2);
    expect(groupSkippedDetailsByTargetDate(details)).toEqual([
      { targetDate: "2026-05-25", count: 2 },
    ]);
  });

  it("keeps the modal open and renders grouped summary for statutory-holiday skipped details", async () => {
    const setShowModal = jest.fn();
    copyWeekScheduleTo.mockResolvedValue({
      created: 8,
      skipped: 2,
      overwritten: 0,
      skippedDetails: [
        { targetDate: "2026-05-25", reason: "STATUTORY_HOLIDAY" },
        { targetDate: "2026-05-25", reason: "STATUTORY_HOLIDAY" },
      ],
    });

    const tree = renderCopyDialog(setShowModal);

    await act(async () => {
      await tree.root.findAllByType("Button")[1].props.onPress();
    });

    expect(setShowModal).not.toHaveBeenCalledWith(false);
    expect(collectText(tree.toJSON())).toContain(
      "Created 8 shifts. Skipped 2 on statutory holiday(s)."
    );
    expect(collectText(tree.toJSON())).toMatch(
      /2026-05-25\s+-\s+2\s+shifts skipped/
    );
  });

  it("closes the modal after successful copy when no statutory-holiday skipped details are returned", async () => {
    const setShowModal = jest.fn();
    copyWeekScheduleTo.mockResolvedValue({
      created: 8,
      skipped: 0,
      overwritten: 0,
      skippedDetails: [],
    });

    const tree = renderCopyDialog(setShowModal);

    await act(async () => {
      await tree.root.findAllByType("Button")[1].props.onPress();
    });

    expect(setShowModal).toHaveBeenCalledWith(false);
  });
});
