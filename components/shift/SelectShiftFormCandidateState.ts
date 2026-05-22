import { ShiftCandidate } from "@/model/ShiftCandidate";

export type CandidateStatus = "alreadyScheduled" | "selected" | "preferred";

export const isCandidateDisabled = (candidate: ShiftCandidate): boolean => {
    return candidate.alreadyScheduled === true;
}

export const getCandidateStatus = (
    candidate: ShiftCandidate,
    checkedUsers: string[]
): CandidateStatus | null => {
    if (candidate.alreadyScheduled === true) {
        return "alreadyScheduled";
    }
    if (checkedUsers.includes(candidate.username)) {
        return "selected";
    }
    if (candidate.preferred === true) {
        return "preferred";
    }
    return null;
}

export const filterSelectableUsernames = (
    usernames: string[],
    candidates: ShiftCandidate[]
): string[] => {
    const disabledUsernames = new Set(
        candidates
            .filter((candidate) => isCandidateDisabled(candidate))
            .map((candidate) => candidate.username)
    );

    return usernames.filter((username) => !disabledUsernames.has(username));
}
