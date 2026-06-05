import * as React from "react";
import renderer from "react-test-renderer";

jest.mock("@gluestack-ui/themed", () => {
  const React = require("react");
  const createPrimitive = (name) => ({ children, ...props }) =>
    React.createElement(name, props, children);

  return {
    BadgeText: createPrimitive("BadgeText"),
    Heading: createPrimitive("Heading"),
    HStack: createPrimitive("HStack"),
    Text: createPrimitive("Text"),
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

describe("ProofStatus display", () => {
  it("derives missing, submitted, and not-required states for admin display", () => {
    const { getProofStatusDisplay } = require("../applications/adminProofStatus");

    expect(
      getProofStatusDisplay({
        leaveType: "SICK",
        sickProofRequired: true,
        sickProofSubmitted: false,
      })
    ).toMatchObject({
      kind: "missing",
      tone: "warning",
      label: "Proof missing",
      shouldShowOnCard: true,
    });

    expect(
      getProofStatusDisplay({
        leaveType: "SICK",
        sickProofRequired: true,
        sickProofSubmitted: true,
        sickProofUploadedAt: "2026-06-03T21:14:00Z",
        sickProofOriginalFilename: "doctor-note.pdf",
      })
    ).toMatchObject({
      kind: "submitted",
      tone: "success",
      label: "Proof submitted",
      filenameText: "doctor-note.pdf",
      shouldShowOnCard: true,
    });

    expect(
      getProofStatusDisplay({
        leaveType: "VACATION",
        sickProofRequired: false,
      })
    ).toMatchObject({
      kind: "not_required",
      tone: "neutral",
      label: "Proof not required",
      shouldShowOnCard: false,
    });
  });

  it("renders HR-readable badge and detail summary text", () => {
    const { ProofStatusBadge, ProofStatusSummary } = require("../applications/ProofStatus");
    const { getProofStatusDisplay } = require("../applications/adminProofStatus");

    const proofStatus = getProofStatusDisplay({
      leaveType: "SICK",
      sickProofRequired: true,
      sickProofSubmitted: false,
    });
    const badge = renderer.create(<ProofStatusBadge proofStatus={proofStatus} />).toJSON();
    const summary = renderer
      .create(
        <ProofStatusSummary
          application={{
            leaveType: "SICK",
            sickProofRequired: true,
            sickProofSubmitted: false,
          }}
        />
      )
      .toJSON();

    expect(collectText(badge)).toContain("Proof missing");
    expect(badge.props["data-testid"]).toBe("proof-status-badge-missing");
    expect(badge.props.style.backgroundColor).toBe("#FFF3E0");
    expect(collectText(summary)).toContain("Proof required for this sick leave");
    expect(collectText(summary)).toContain("No file uploaded yet");
  });
});
