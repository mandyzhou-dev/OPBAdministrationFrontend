import * as React from "react";
import renderer, { act } from "react-test-renderer";

const mockDeleteApplication = jest.fn();
const mockGetApplicationByApplicant = jest.fn();

jest.mock("@/service/ApplicationService", () => ({
  deleteApplication: (...args) => mockDeleteApplication(...args),
  getApplicationByApplicant: (...args) => mockGetApplicationByApplicant(...args),
}));

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    AlertDialog: createPrimitive("AlertDialog"),
    AlertDialogBackdrop: createPrimitive("AlertDialogBackdrop"),
    AlertDialogBody: createPrimitive("AlertDialogBody"),
    AlertDialogCloseButton: createPrimitive("AlertDialogCloseButton"),
    AlertDialogContent: createPrimitive("AlertDialogContent"),
    AlertDialogFooter: createPrimitive("AlertDialogFooter"),
    AlertDialogHeader: createPrimitive("AlertDialogHeader"),
    Button: createPrimitive("Button"),
    ButtonGroup: createPrimitive("ButtonGroup"),
    ButtonText: createPrimitive("ButtonText"),
    Card: createPrimitive("Card"),
    CloseIcon: "CloseIcon",
    Heading: createPrimitive("Heading"),
    HStack: createPrimitive("HStack"),
    Icon: createPrimitive("Icon"),
    Input: createPrimitive("Input"),
    InputField: createPrimitive("InputField"),
    ScrollView: createPrimitive("ScrollView"),
    Text: createPrimitive("Text"),
  };
});

jest.mock("@/components/applications/ApplicationCardforE", () => {
  const React = require("react");
  return {
    ApplicationCardforE: ({ application, deleteApplication }) =>
      React.createElement(
        "ApplicationCardforE",
        {
          application,
          onPress: () => deleteApplication(application),
        },
        application.status
      ),
  };
});

const applications = [
  { id: 1, status: "pending", applicant: "employee1" },
  { id: 2, status: "approved", applicant: "employee1" },
];

const flushPromises = () => act(async () => {
  await Promise.resolve();
});

describe("MyApplications delete flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    global.localStorage = {
      getItem: jest.fn(() => JSON.stringify({ username: "employee1" })),
    };
    mockGetApplicationByApplicant.mockResolvedValue(applications);
    mockDeleteApplication.mockResolvedValue({});
  });

  it("blocks non-deletable applications before opening the modal", async () => {
    const MyApplications = require("../../app/applications/MyApplications").default;
    let component;

    await act(async () => {
      component = renderer.create(<MyApplications />);
    });

    await flushPromises();

    const approvedCard = component.root
      .findAllByType("ApplicationCardforE")
      .find((card) => card.props.application.id === 2);

    act(() => {
      approvedCard.props.onPress();
    });

    expect(global.alert).toHaveBeenCalledWith("This application can no longer be deleted.");
    expect(component.root.findByType("AlertDialog").props.isOpen).toBe(false);
  });

  it("awaits delete success before success feedback and removes the card", async () => {
    const MyApplications = require("../../app/applications/MyApplications").default;
    let resolveDelete;
    mockDeleteApplication.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );
    let component;

    await act(async () => {
      component = renderer.create(<MyApplications />);
    });

    await flushPromises();

    const pendingCard = component.root
      .findAllByType("ApplicationCardforE")
      .find((card) => card.props.application.id === 1);

    act(() => {
      pendingCard.props.onPress();
    });

    await act(async () => {
      const deleteButton = component.root
        .findAllByType("Button")
        .find((button) => button.props.action === "negative");
      deleteButton.props.onPress();
      await Promise.resolve();
    });

    expect(mockDeleteApplication).toHaveBeenCalledWith(1);
    expect(global.alert).not.toHaveBeenCalledWith("successfully deleted");
    expect(component.root.findByType("AlertDialog").props.isOpen).toBe(true);

    await act(async () => {
      resolveDelete({});
      await Promise.resolve();
    });

    expect(global.alert).toHaveBeenCalledWith("successfully deleted");
    expect(component.root.findByType("AlertDialog").props.isOpen).toBe(false);
    expect(component.root.findAllByType("ApplicationCardforE").map((card) => card.props.application.id)).toEqual([2]);
  });

  it("shows a soft 409 message and refreshes the list", async () => {
    const MyApplications = require("../../app/applications/MyApplications").default;
    mockDeleteApplication.mockRejectedValue({ response: { status: 409 } });
    mockGetApplicationByApplicant
      .mockResolvedValueOnce(applications)
      .mockResolvedValueOnce([{ id: 1, status: "approved", applicant: "employee1" }]);
    let component;

    await act(async () => {
      component = renderer.create(<MyApplications />);
    });

    await flushPromises();

    const pendingCard = component.root
      .findAllByType("ApplicationCardforE")
      .find((card) => card.props.application.id === 1);

    act(() => {
      pendingCard.props.onPress();
    });

    await act(async () => {
      const deleteButton = component.root
        .findAllByType("Button")
        .find((button) => button.props.action === "negative");
      deleteButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(global.alert).toHaveBeenCalledWith("This application can no longer be deleted.");
    expect(mockGetApplicationByApplicant).toHaveBeenCalledTimes(2);
    expect(component.root.findAllByType("ApplicationCardforE").map((card) => card.props.application.status)).toEqual(["approved"]);
  });
});
