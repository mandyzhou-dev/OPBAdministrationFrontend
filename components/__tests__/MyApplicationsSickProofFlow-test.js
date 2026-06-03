import * as React from "react";
import renderer, { act } from "react-test-renderer";

const mockDeleteApplication = jest.fn();
const mockGetApplicationByApplicant = jest.fn();
const mockUploadSickProof = jest.fn();

jest.mock("@/service/ApplicationService", () => ({
  deleteApplication: (...args) => mockDeleteApplication(...args),
  getApplicationByApplicant: (...args) => mockGetApplicationByApplicant(...args),
  uploadSickProof: (...args) => mockUploadSickProof(...args),
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
    ApplicationCardforE: ({ application, uploadSickProof }) =>
      React.createElement(
        "ApplicationCardforE",
        {
          application,
          upload: (file) => uploadSickProof(application, file),
        },
        application.sickProofSubmitted ? "submitted" : "required"
      ),
  };
});

const applications = [
  {
    id: 1,
    status: "pending",
    applicant: "employee1",
    leaveType: "SICK",
    sickProofRequired: true,
    sickProofSubmitted: false,
  },
];

const flushPromises = () => act(async () => {
  await Promise.resolve();
});

describe("MyApplications sick proof upload flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    global.localStorage = {
      getItem: jest.fn(() => JSON.stringify({ username: "employee1" })),
    };
    mockGetApplicationByApplicant.mockResolvedValue(applications);
    mockUploadSickProof.mockResolvedValue({
      ...applications[0],
      sickProofSubmitted: true,
      sickProofOriginalFilename: "proof.pdf",
    });
  });

  it("passes applicant to the upload request and replaces the updated card", async () => {
    const MyApplications = require("../../app/applications/MyApplications").default;
    const file = { name: "proof.pdf", type: "application/pdf", size: 2048 };
    let component;

    await act(async () => {
      component = renderer.create(<MyApplications />);
    });

    await flushPromises();

    const card = component.root.findByType("ApplicationCardforE");

    await act(async () => {
      await card.props.upload(file);
      await Promise.resolve();
    });

    expect(mockUploadSickProof).toHaveBeenCalledWith(1, file, "employee1");
    expect(component.root.findByType("ApplicationCardforE").props.application.sickProofSubmitted).toBe(true);
    expect(global.alert).toHaveBeenCalledWith("Proof uploaded successfully.");
  });
});
