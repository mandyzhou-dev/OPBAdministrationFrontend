import moment from "moment";
import { LeaveApplication } from "@/model/LeaveApplication";

export type ProofStatusKind = "missing" | "submitted" | "not_required";
export type ProofStatusTone = "warning" | "success" | "neutral";

export interface ProofStatusDisplay {
    kind: ProofStatusKind;
    tone: ProofStatusTone;
    label: string;
    uploadedAtText?: string;
    filenameText?: string;
    shouldShowOnCard: boolean;
}

export const isSickLeaveApplication = (application:LeaveApplication) => application.leaveType?.trim().toUpperCase() === "SICK";

export const isProofRequiredForAdmin = (application:LeaveApplication) => {
    return application.sickProofRequired === true || (application.sickProofRequired !== false && isSickLeaveApplication(application));
};

const shortenFilename = (filename?: string | null) => {
    const trimmed = filename?.trim();
    if(!trimmed){
        return undefined;
    }
    if(trimmed.length <= 34){
        return trimmed;
    }
    const extensionIndex = trimmed.lastIndexOf(".");
    const extension = extensionIndex > 0 ? trimmed.slice(extensionIndex) : "";
    const basename = extension ? trimmed.slice(0, extensionIndex) : trimmed;
    return `${basename.slice(0, 16)}...${basename.slice(-8)}${extension}`;
};

const formatUploadedAt = (uploadedAt?: Date | string | null) => {
    if(!uploadedAt){
        return undefined;
    }
    const value = moment(uploadedAt);
    return value.isValid() ? value.format("MMM D, YYYY, h:mm A") : undefined;
};

export const getProofStatusDisplay = (application:LeaveApplication):ProofStatusDisplay => {
    const required = isProofRequiredForAdmin(application);

    if(!required){
        return {
            kind: "not_required",
            tone: "neutral",
            label: "Proof not required",
            shouldShowOnCard: false,
        };
    }

    if(application.sickProofSubmitted === true){
        return {
            kind: "submitted",
            tone: "success",
            label: "Proof submitted",
            uploadedAtText: formatUploadedAt(application.sickProofUploadedAt),
            filenameText: shortenFilename(application.sickProofOriginalFilename),
            shouldShowOnCard: true,
        };
    }

    return {
        kind: "missing",
        tone: "warning",
        label: "Proof missing",
        shouldShowOnCard: true,
    };
};
