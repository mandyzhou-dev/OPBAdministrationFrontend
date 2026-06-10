# Login Response Privacy Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the frontend so login consumes and persists only the backend's minimal login response, and no page depends on privacy fields from `localStorage.user`.

**Architecture:** Keep the existing login screen and route flow, but introduce a dedicated frontend `LoginResponse`/auth-session type separate from the broad `User` model used by user lists and profile-like data. Store only the minimal login response in `localStorage.user` for compatibility with existing app reads, then update profile-related UI to stop reading email, birthdate, phone, and address from login state. Do not add a frontend call to a new profile endpoint in this issue unless the backend also adds an authenticated `/me/profile` contract; otherwise the privacy leak is only moved out of login.

**Tech Stack:** Expo, React Native Web, TypeScript, axios, Gluestack UI, MUI TextField, Jest where focused tests exist.

---

## Current Context

- Frontend project: `/Users/marktwain/Projects/OPBOA`
- Backend project: `/Users/marktwain/Projects/OPBAdministrationBackend`
- Frontend README read: `README.md`
- Backend README read: `/Users/marktwain/Projects/OPBAdministrationBackend/Readme.md`
- Current login request wrapper: `request/UserRequest.ts`, `login(...)`
- Current login service: `service/UserService.ts`, `login(...)`
- Current broad frontend user model: `model/User.ts`
- Current auth helper: `util/useAuth.ts`
- Current profile component: `components/Profile.tsx`
- Current consumers of `localStorage.user`: multiple app screens use `username`, `roles`, `name`, `groupName`, and `jsessionID`; `Profile` uses privacy fields that must stop coming from login state.

## Required API Contract

The backend plan requires `POST /api/user/login` to keep the same request body and return this flat minimal response:

```json
{
  "username": "employee1",
  "name": "Employee One",
  "roles": "tester|Manager",
  "groupName": "surrey",
  "jsessionID": "03BF94E92873D84D44D2B1FBA27F3B0A",
  "token": "eyJhbGciOiJIUzI1NiJ9.example.signature"
}
```

Frontend must not expect or persist these fields from login:

- `email`
- `phoneNumber`
- `address`
- `birthdate`
- `legalName` / `legalname`
- `sinno`
- `password`
- `personalDocumentsPath`
- `personalDocuments`
- `active`
- `bigDay`

No database change is required by the frontend. There is no table structure or SQL for this issue.

## Files To Modify

- Create: `model/LoginResponse.ts`
  - Responsibility: define the minimal auth-session response shape returned by login.
- Modify: `request/UserRequest.ts`
  - Responsibility: make `login(...)` return `Promise<LoginResponse>` instead of `Promise<User>`.
- Modify: `service/UserService.ts`
  - Responsibility: store only the minimal response in `localStorage.user`.
- Modify: `util/useAuth.ts`
  - Responsibility: type the stored auth session and keep role parsing based on minimal fields.
- Modify: `components/Profile.tsx`
  - Responsibility: remove dependency on email, birthdate, phone, and address from login state; show only safe account fields until an authenticated profile endpoint exists.
- Modify: `app/(tabs)/index.tsx`
  - Responsibility: remove stale/commented or active usage of `user.email` from login state.
- Modify: `request/ShiftRequest.ts`
  - Responsibility: continue reading `jsessionID` from auth session for current compatibility and tolerate legacy `JSessionID` only during migration if necessary.
- Create: `components/__tests__/LoginResponsePrivacy-test.js`
  - Responsibility: verify login storage strips privacy fields even if a backend accidentally sends them during transition.
- Create: `components/__tests__/ProfileMinimalAuth-test.js`
  - Responsibility: verify Profile no longer renders privacy fields from `localStorage.user`.

## Task 1: Add Dedicated LoginResponse Type

**Files:**

- Create: `model/LoginResponse.ts`

- [ ] **Step 1: Add the minimal auth-session type**

Create `model/LoginResponse.ts`:

```ts
export interface LoginResponse {
  username: string;
  name: string;
  roles: string;
  groupName?: string | null;
  jsessionID?: string | null;
  token: string;
}

export const sanitizeLoginResponse = (data: any): LoginResponse => ({
  username: data?.username ?? "",
  name: data?.name ?? "",
  roles: data?.roles ?? "",
  groupName: data?.groupName ?? null,
  jsessionID: data?.jsessionID ?? data?.JSessionID ?? null,
  token: data?.token ?? "",
});
```

Reasoning:

- `LoginResponse` is intentionally separate from `User`.
- `sanitizeLoginResponse(...)` drops any accidental privacy fields before storage.
- `data?.JSessionID` is accepted only as rollout compatibility because older docs used that spelling; the canonical frontend field should be `jsessionID`.

## Task 2: Update Login Request And Storage

**Files:**

- Modify: `request/UserRequest.ts`
- Modify: `service/UserService.ts`
- Test: `components/__tests__/LoginResponsePrivacy-test.js`

- [ ] **Step 1: Write failing storage sanitization test**

Create `components/__tests__/LoginResponsePrivacy-test.js`:

```js
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
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/LoginResponsePrivacy-test.js --runInBand --watchAll=false
```

Expected: FAIL because current `service/UserService.ts` stores the whole response object.

- [ ] **Step 3: Update `request/UserRequest.ts` login return type**

Change imports:

```ts
import { LoginResponse } from "@/model/LoginResponse";
```

Change login signature:

```ts
login = async(username:string, password:string):Promise<LoginResponse> =>{
```

Keep the request body unchanged:

```ts
{
  username: username,
  password: password,
}
```

- [ ] **Step 4: Update `service/UserService.ts` to sanitize before storage**

Change imports:

```ts
import { LoginResponse, sanitizeLoginResponse } from "@/model/LoginResponse";
```

Change login implementation:

```ts
export const login = async(username:string, password:string):Promise<LoginResponse>=>{
    const userRequest = new UserRequest()
    const data = await userRequest.login(username,password)
    const session = sanitizeLoginResponse(data)

    localStorage.setItem("user", JSON.stringify(session));
    return session;
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/LoginResponsePrivacy-test.js --runInBand --watchAll=false
```

Expected: PASS.

## Task 3: Update Auth Helper And Session Consumers

**Files:**

- Modify: `util/useAuth.ts`
- Modify: `request/ShiftRequest.ts`

- [ ] **Step 1: Type auth state as LoginResponse**

In `util/useAuth.ts`, import the type:

```ts
import { LoginResponse } from '@/model/LoginResponse';
```

Use a nullable session type for parsed local storage:

```ts
const [user, setUser] = useState<LoginResponse | null>(() => {
```

Keep existing role parsing compatible with string roles:

```ts
const rolesArray = user.roles.split('|');
```

- [ ] **Step 2: Keep shift request session compatibility**

In `request/ShiftRequest.ts`, replace direct nested parsing with a small local extraction before setting cookies:

```ts
const storedUser = JSON.parse(localStorage.getItem("user") as string);
cookies.set('JSESSIONID', storedUser?.jsessionID ?? storedUser?.JSessionID)
```

This preserves current `JSESSIONID` cookie behavior while the backend/frontend align on `jsessionID`.

## Task 4: Remove Profile Dependence On Login Privacy Fields

**Files:**

- Modify: `components/Profile.tsx`
- Modify: `app/(tabs)/index.tsx`
- Test: `components/__tests__/ProfileMinimalAuth-test.js`

- [ ] **Step 1: Write a failing Profile privacy test**

Create `components/__tests__/ProfileMinimalAuth-test.js`:

```js
import React from "react";
import { render } from "@testing-library/react-native";
import { Profile } from "@/components/Profile";

jest.mock("expo-router", () => ({
  router: {
    navigate: jest.fn(),
  },
}));

describe("Profile with minimal login state", () => {
  beforeEach(() => {
    global.localStorage = {
      getItem: jest.fn(() => JSON.stringify({
        username: "employee1",
        name: "Employee One",
        roles: "tester",
        groupName: "surrey",
        jsessionID: "session-123",
        token: "jwt-token",
      })),
      removeItem: jest.fn(),
    };
    global.window = { location: { reload: jest.fn() } };
  });

  it("renders safe account fields and does not render empty privacy inputs from login state", () => {
    const { queryByDisplayValue, queryByText } = render(<Profile />);

    expect(queryByText("Employee One")).toBeTruthy();
    expect(queryByDisplayValue("employee1")).toBeTruthy();
    expect(queryByDisplayValue("Invalid date")).toBeNull();
    expect(queryByText("Email")).toBeNull();
    expect(queryByText("Birthdate")).toBeNull();
    expect(queryByText("PhoneNumber")).toBeNull();
    expect(queryByText("Address")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused Profile test and verify it fails**

Run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/ProfileMinimalAuth-test.js --runInBand --watchAll=false
```

Expected: FAIL because current `Profile` renders privacy fields from `localStorage.user`.

- [ ] **Step 3: Update `components/Profile.tsx`**

Keep these fields in the component:

- Display name from `user.name`
- Username TextField from `user.username`
- Set Password action
- Log out action

Remove these login-state fields from the component:

- Email TextField
- Birthdate TextField
- PhoneNumber TextField
- Address TextField

Do not add replacement inputs or profile-detail helper text in this issue. Keep the Profile screen minimal until a properly authenticated profile endpoint is designed.

- [ ] **Step 4: Remove stale email usage from `app/(tabs)/index.tsx`**

Delete the commented or debug block that references `user.email`:

```ts
/*alert(user.active)
alert(user.email)
if(user.active!==1){
  alert(user.active)
  localStorage.removeItem("user")
  return;
}*/
```

Do not replace this with any frontend security check. Backend login and later backend endpoints must own authorization decisions.

- [ ] **Step 5: Run focused tests**

Run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/LoginResponsePrivacy-test.js components/__tests__/ProfileMinimalAuth-test.js --runInBand --watchAll=false
```

Expected: PASS.

## Task 5: Frontend Verification

**Files:**

- No additional file changes.

- [ ] **Step 1: Search for privacy-field reads from login storage**

Run:

```bash
rg -n "localStorage\\.getItem\\(['\\\"]user|user\\.email|user\\.phoneNumber|user\\.address|user\\.birthdate|user\\.active" app components service request util model --glob '!node_modules/**'
```

Expected:

- `localStorage.user` reads remain for `username`, `roles`, `name`, `groupName`, and `jsessionID` compatibility.
- No active code depends on `user.email`, `user.phoneNumber`, `user.address`, `user.birthdate`, or `user.active` from login storage.

- [ ] **Step 2: Run focused Jest tests**

Run:

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/LoginResponsePrivacy-test.js components/__tests__/ProfileMinimalAuth-test.js --runInBand --watchAll=false
```

Expected: PASS.

- [ ] **Step 3: Run TypeScript check and record known unrelated failures if any**

Run:

```bash
npx tsc --noEmit
```

Expected: ideally PASS. If it fails on known unrelated pre-existing files listed in the README, record the exact filenames and confirm the login/privacy files are not among the failures.

## Frontend Acceptance Criteria

- Login request body remains unchanged.
- `UserRequest.login(...)` returns the minimal `LoginResponse` type.
- `UserService.login(...)` stores only `username`, `name`, `roles`, `groupName`, `jsessionID`, and `token` in `localStorage.user`.
- Frontend no longer depends on `email`, `phoneNumber`, `address`, `birthdate`, `legalName`, `active`, or other privacy fields from login state.
- Profile does not show blank or invalid privacy fields when only minimal login state exists.
- Mobile layout is not worsened: Profile remains a simple vertical layout with touch-friendly Set Password and Log out actions.
- No frontend database or SQL work is required.

## Cross-Stack Handoff To Backend

Backend must return this exact minimal shape from `POST /api/user/login`:

```ts
export interface LoginResponse {
  username: string;
  name: string;
  roles: string;
  groupName?: string | null;
  jsessionID?: string | null;
  token: string;
}
```

If backend cannot emit `jsessionID` immediately and emits `JSessionID` during transition, frontend `sanitizeLoginResponse(...)` accepts both, but all new code should use `jsessionID`.

Do not add or consume a profile endpoint in this issue unless backend also implements real authenticated identity for that endpoint. Without backend authentication enforcement, a new profile endpoint would reintroduce the privacy leak outside login.
