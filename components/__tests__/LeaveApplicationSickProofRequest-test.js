jest.mock("axios", () => ({
  post: jest.fn(),
}));

describe("LeaveApplicationRequest sick proof upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.EXPO_PUBLIC_API_URL = "https://example.test/";
  });

  it("posts multipart sick proof uploads with file and applicant", async () => {
    const axios = require("axios");
    axios.post.mockResolvedValue({ data: { id: 7, sickProofSubmitted: true } });
    const { LeaveApplicationRequest } = require("@/request/LeaveApplicationRequest");
    const request = new LeaveApplicationRequest();
    const file = new Blob(["proof"], { type: "application/pdf" });

    const response = await request.uploadSickProof(7, file, "employee1");

    expect(response).toEqual({ id: 7, sickProofSubmitted: true });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("api/process/application/7/sick-proof"),
      expect.any(FormData),
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "multipart/form-data" }),
      })
    );
    const formData = axios.post.mock.calls[0][1];
    expect(formData.get("proof").type).toBe("application/pdf");
    expect(formData.get("proof").size).toBe(5);
    expect(formData.get("applicant")).toBe("employee1");
  });
});
