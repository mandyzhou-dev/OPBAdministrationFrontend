import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  defaults: {
    withCredentials: false,
    headers: {
      common: {},
    },
  },
}));

describe("application history request contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_API_URL = "https://api.example/";
  });

  it("requests paged application history with operator and selected employee", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        content: [{ id: 1, applicant: "worker1" }],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        sort: "submitTime,desc",
      },
    });

    const { LeaveApplicationRequest } = require("@/request/LeaveApplicationRequest");
    const request = new LeaveApplicationRequest();
    const result = await request.getApplicationHistory({
      operatorUsername: "manager1",
      employeeUsername: "worker1",
      page: 0,
      size: 20,
      sort: "submitTime,desc",
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("api/process/application/history"),
      {
        params: {
          operatorUsername: "manager1",
          employeeUsername: "worker1",
          page: 0,
          size: 20,
          sort: "submitTime,desc",
        },
      }
    );
    expect(result.content).toEqual([{ id: 1, applicant: "worker1" }]);
  });

  it("preserves employeeUsername exactly when requesting application history", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        sort: "submitTime,desc",
      },
    });

    const { LeaveApplicationRequest } = require("@/request/LeaveApplicationRequest");
    const request = new LeaveApplicationRequest();
    await request.getApplicationHistory({
      operatorUsername: "manager1",
      employeeUsername: "Harsimranjit Kaur ",
      page: 0,
      size: 20,
      sort: "submitTime,desc",
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("api/process/application/history"),
      {
        params: {
          operatorUsername: "manager1",
          employeeUsername: "Harsimranjit Kaur ",
          page: 0,
          size: 20,
          sort: "submitTime,desc",
        },
      }
    );
  });

  it("sends review comments as JSON for approve and decline decisions", async () => {
    axios.post.mockResolvedValue({ data: {} });

    const { LeaveApplicationRequest } = require("@/request/LeaveApplicationRequest");
    const request = new LeaveApplicationRequest();
    await request.permitReview(12, "  conditional approval  ");
    await request.permitReview(13, "   ");
    await request.rejectReview(14, "Needs more detail");

    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("api/process/application/12/permit"),
      { reviewComment: "conditional approval" },
      { headers: { "Content-Type": "application/json" } }
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("api/process/application/13/permit"),
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("api/process/application/14/reject"),
      { reviewComment: "Needs more detail" },
      { headers: { "Content-Type": "application/json" } }
    );
  });

  it("requests leave date availability with applicant and date-only range", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        applicant: "worker1",
        from: "2026-05-27",
        to: "2026-08-25",
        businessZone: "America/Vancouver",
        dates: [{ date: "2026-05-27", scheduled: true, shiftIds: [101] }],
      },
    });

    const { LeaveApplicationRequest } = require("@/request/LeaveApplicationRequest");
    const request = new LeaveApplicationRequest();
    const result = await request.getLeaveDateAvailability("worker1", "2026-05-27", "2026-08-25");

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("api/process/application/leave-date-availability"),
      {
        params: {
          applicant: "worker1",
          from: "2026-05-27",
          to: "2026-08-25",
        },
      }
    );
    expect(result.dates).toEqual([{ date: "2026-05-27", scheduled: true, shiftIds: [101] }]);
  });

  it("requests employee options with activeOnly enabled by default", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ username: "worker1", name: "Worker One", active: 1 }],
    });

    const { UserRequest } = require("@/request/UserRequest");
    const request = new UserRequest();
    const result = await request.getEmployeeOptions();

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("api/presentor/user/employees/options"),
      {
        params: {
          activeOnly: true,
        },
      }
    );
    expect(result).toEqual([{ username: "worker1", name: "Worker One", active: 1 }]);
  });
});
