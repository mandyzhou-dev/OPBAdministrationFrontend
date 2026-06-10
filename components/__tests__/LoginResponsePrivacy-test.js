jest.mock("@/request/UserRequest", () => {
  return {
    UserRequest: jest.fn().mockImplementation(() => ({
      login: jest.fn().mockResolvedValue({
        username: "employee1",
        name: "Employee One",
        roles: "tester",
        groupName: "surrey",
        jsessionID: "session-123",
        token: "jwt-token",
        email: "private@example.com",
        phoneNumber: "6045550100",
        address: "123 Private Street",
        birthdate: "1990-01-15",
        active: 1,
      }),
    })),
  };
});

describe("login privacy storage", () => {
  beforeEach(() => {
    global.localStorage = {
      store: {},
      getItem: jest.fn((key) => global.localStorage.store[key] || null),
      setItem: jest.fn((key, value) => {
        global.localStorage.store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete global.localStorage.store[key];
      }),
    };
  });

  it("stores only minimal login fields", async () => {
    const { login } = require("@/service/UserService");

    await login("employee1", "password");

    const stored = JSON.parse(global.localStorage.store.user);
    expect(stored).toEqual({
      username: "employee1",
      name: "Employee One",
      roles: "tester",
      groupName: "surrey",
      jsessionID: "session-123",
      token: "jwt-token",
    });
    expect(stored.email).toBeUndefined();
    expect(stored.phoneNumber).toBeUndefined();
    expect(stored.address).toBeUndefined();
    expect(stored.birthdate).toBeUndefined();
    expect(stored.active).toBeUndefined();
  });
});
