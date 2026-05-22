import {
  filterSelectableUsernames,
  getCandidateStatus,
  isCandidateDisabled,
} from "@/components/shift/SelectShiftFormCandidateState";

describe("SelectShiftForm candidate state", () => {
  it("marks preferred available candidates as preferred and selectable", () => {
    const candidate = {
      username: "alice",
      name: "Alice",
      preferred: true,
      alreadyScheduled: false,
    };

    expect(getCandidateStatus(candidate, [])).toBe("preferred");
    expect(isCandidateDisabled(candidate)).toBe(false);
  });

  it("marks already scheduled candidates as disabled", () => {
    const candidate = {
      username: "bob",
      name: "Bob",
      preferred: false,
      alreadyScheduled: true,
    };

    expect(getCandidateStatus(candidate, [])).toBe("alreadyScheduled");
    expect(isCandidateDisabled(candidate)).toBe(true);
  });

  it("prioritizes already scheduled over preferred", () => {
    const candidate = {
      username: "casey",
      name: "Casey",
      preferred: true,
      alreadyScheduled: true,
    };

    expect(getCandidateStatus(candidate, ["casey"])).toBe("alreadyScheduled");
    expect(isCandidateDisabled(candidate)).toBe(true);
  });

  it("leaves normal available candidates without a status", () => {
    const candidate = {
      username: "devon",
      name: "Devon",
      preferred: false,
      alreadyScheduled: false,
    };

    expect(getCandidateStatus(candidate, [])).toBeNull();
    expect(isCandidateDisabled(candidate)).toBe(false);
  });

  it("prioritizes selected over preferred when candidate is available", () => {
    const candidate = {
      username: "erin",
      name: "Erin",
      preferred: true,
      alreadyScheduled: false,
    };

    expect(getCandidateStatus(candidate, ["erin"])).toBe("selected");
  });

  it("filters disabled usernames before selection or submit", () => {
    const candidates = [
      {
        username: "alice",
        name: "Alice",
        preferred: true,
        alreadyScheduled: false,
      },
      {
        username: "bob",
        name: "Bob",
        preferred: false,
        alreadyScheduled: true,
      },
    ];

    expect(filterSelectableUsernames(["alice", "bob"], candidates)).toEqual([
      "alice",
    ]);
  });
});
