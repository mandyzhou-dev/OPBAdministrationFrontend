# Frontend Plan: Annual Vacation

日期：2026-06-17

项目目录：`/Users/marktwain/Projects/OPBOA`

当前阶段只写前端方案，不写业务代码，不操作数据库。

## 1. 目标口径

- 新增 Leave Type：Annual Vacation，提交给后端的 `leaveType` 建议为 `ANNUAL_VACATION`。
- 新增 Shift Status：`annual_vacation`，由 Manager/HR 在 schedule cell 中标记。
- 员工未满 12 个月、没有 annual vacation entitlement、剩余天数为 0 时，不能提交 annual vacation application。
- 只要剩余天数至少 1 天，员工申请阶段不按日期跨度推算消耗天数，不要求当前 schedule 已经存在。
- Annual vacation 不允许半天或部分小时。前端不显示 `HHmm-HHmm` time input，提交完整日期范围。
- 实际扣减由 Manager/HR mark schedule cell 为 annual vacation 完成，交互参考 paid sick leave。
- 被标记 annual vacation 的 schedule cell 作为 non-worked status 展示；worked hours/KPI 由后端排除。
- 移动端要保持 DatePicker/RangePicker、余额提示、状态下拉在窄屏可读可点。

## 2. 现有前端依据

相关文件：

- `app/applications/NewApplication.tsx`
- `model/LeaveApplication.ts`
- `model/LeaveDateAvailability.ts`
- `request/LeaveApplicationRequest.ts`
- `service/ApplicationService.ts`
- `util/leaveDateAvailability.ts`
- `components/applications/ApplicationCardforE.tsx`
- `components/applications/ReviewOfApplicationCard.tsx`
- `components/applications/HistoryApplicationCard.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `components/shift/ShiftCell.tsx`
- `constants/ShiftStatus.ts`
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `model/PaidSickLeaveQuota.ts`

现状：

- `NewApplication.tsx` 现在有 `SICK` 和 `personalleave` 两个 leave type。
- `SICK` 使用 `leave-date-availability` API 禁用没有 schedule 的日期。
- 普通 leave 只做 past-date 禁用。
- one-day leave 需要手动输入 `Time`，range leave 使用全天 `00:00` 到 `23:59`。
- `ShiftDetailModal` 已有 paid sick leave quota 查询、status select、confirm dialog。
- `constants/ShiftStatus.ts` 集中管理 shift status label、manual options、non-worked statuses、颜色。

## 3. 前后端交互契约

### 3.1 Annual vacation balance

新增请求：

```text
GET /api/process/application/annual-vacation-balance?applicant=<username>
```

前端 model：

```ts
export interface AnnualVacationBalance {
  username: string;
  businessZone: "America/Vancouver";
  eligible: boolean;
  eligibilityReason:
    | "ELIGIBLE"
    | "MISSING_BIG_DAY"
    | "BEFORE_FIRST_ANNIVERSARY"
    | "NO_ENTITLEMENT_RECORD"
    | "NO_REMAINING_DAYS";
  serviceYearStart?: string;
  serviceYearEnd?: string;
  regularWorkdaysPerWeek?: number;
  entitlementDays: number;
  usedDays: number;
  remainingDays: number;
}
```

### 3.2 Leave application submit

继续使用：

```text
PUT /api/process/application/leave-application
```

Annual vacation payload：

```ts
{
  applicant: username,
  start: "YYYY-MM-DDT00:00:00-07:00",
  end: "YYYY-MM-DDT23:59:00-07:00",
  leaveType: "ANNUAL_VACATION",
  reason: commentValue
}
```

前端提交前规则：

- 选择 annual vacation 时先获取 balance。
- `eligible !== true` 或 `remainingDays <= 0` 时阻止提交。
- 不按 selected date count 和 `remainingDays` 做比较。
- 不调用 sick leave availability API。
- 不因当前 schedule 没有班而禁用日期。
- past date 仍禁用，Vancouver today 可以选。

### 3.3 Shift status quota

新增请求：

```text
GET /api/shift/shiftarrangement/{id}/annual-vacation-quota?operatorUsername=<manager>
```

前端 model 可复用 `AnnualVacationBalance` 并加：

```ts
export interface AnnualVacationQuota extends AnnualVacationBalance {
  targetDate: string;
  targetDateAlreadyCounted: boolean;
  canMarkAnnualVacation: boolean;
  message?: string;
}
```

标记 status 继续使用：

```text
PATCH /api/shift/shiftarrangement/{id}/status
```

Request：

```ts
{
  status: "annual_vacation",
  operatorUsername: username
}
```

## 4. Leave Application 页面方案

### 4.1 Leave type

在 `RequiredFormControl` items 中新增：

- Label: `Annual Vacation`
- Value: `ANNUAL_VACATION`

建议新增 helper：

- `isSickLeave(leaveType)`
- `isAnnualVacation(leaveType)`

避免在组件内散落 string comparison。

### 4.2 日期与时间 UI

Annual vacation 必须完整一天：

- one-day annual vacation：显示 `DatePicker`，隐藏 `Time` input。
- range annual vacation：显示 `RangePicker`。
- 提交时 one-day 使用所选日期 `00:00` 到 `23:59`。
- range 使用 start date `00:00` 到 end date `23:59`。

Mobile/narrow layout：

- DatePicker/RangePicker 保持 `style={{ width: "100%" }}`。
- 余额 helper text 放在日期控件下方，短句显示，允许换行。
- 不新增大卡片，避免移动端表单过长；沿用 sick leave helper text 的小号说明样式。

### 4.3 Balance helper

选择 `ANNUAL_VACATION` 时：

- 调 `getAnnualVacationBalance(username)`。
- loading: `Loading annual vacation balance...`
- eligible 且 remaining > 0: `Annual vacation remaining: X/Y days. HR finalizes usage by marking scheduled shifts.`
- 未满 12 个月: `Annual vacation is available after 12 months of continuous employment.`
- 没有 entitlement record: `Annual vacation balance is not available. Please contact HR.`
- remaining 0: `Annual vacation balance used up.`

提交按钮逻辑：

- annual vacation balance 未加载完成时，不允许提交，避免绕过。
- 如果后端返回 400/403，显示后端错误并保留用户输入。

## 5. Shift / Schedule 页面方案

### 5.1 constants

`constants/ShiftStatus.ts` 增加：

```ts
export type ShiftStatus =
  | "active"
  | "cancelled"
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave"
  | "annual_vacation";
```

`ManualShiftStatus` 增加 `annual_vacation`。

Labels：

- `annual_vacation`: `Annual vacation`

Manual option：

- Label: `Mark as annual vacation`
- Value: `annual_vacation`

Non-worked：

- 加入 `annual_vacation`。

颜色建议：

- annual vacation 沿用 paid sick leave 的淡紫色，避免增加过多状态颜色。
- paid sick leave 继续淡紫色。
- unpaid/no show/cancelled 继续灰色。

### 5.2 ShiftCell

`ShiftCell.tsx` 继续从 `workerShift.status` 读取状态：

- `annual_vacation` 要显示 annual vacation 状态 detail text，颜色沿用 paid sick leave 的淡紫色。
- 员工端只读可见。
- Manager/可编辑用户点击后进入 modal。

### 5.3 ShiftDetailModal

复用 paid sick leave 交互：

- modal open 且当前用户是 Manager 时，同时加载 paid sick quota 和 annual vacation quota。
- 状态区显示当前 status。
- 下拉新增 `Mark as annual vacation`。
- 如果 `canMarkAnnualVacation === false`，annual vacation option locked。
- 选中 annual vacation 后弹确认 dialog：
  - `Mark {name} shift on YYYY-MM-DD as Annual vacation?`
  - helper: `Annual vacation used: X/Y days`
  - 如果 target day already counted: `This day is already counted; no extra annual vacation day will be used.`

错误处理：

- 后端拒绝时 alert: `Annual vacation unavailable` + 后端 message。
- 保存中按钮稳定显示 `Saving...`，不要改变 modal 宽度。

## 6. Data Model / Request 改动

新增：

- `model/AnnualVacationBalance.ts`
- `request/LeaveApplicationRequest.getAnnualVacationBalance(applicant)`
- `request/ShiftRequest.getAnnualVacationQuota(shiftId, operatorUsername)`
- `service/ApplicationService.getAnnualVacationBalance`
- `service/ShiftService.getAnnualVacationQuota`

修改：

- `model/LeaveDateAvailability.ts` 或新增专门 payload type，允许 `leaveType: "ANNUAL_VACATION"`。
- `model/Shift.ts` status type 覆盖 `annual_vacation`。
- `model/LeaveApplication.ts` 可继续 `string | undefined`，但 UI label helper 应识别 `ANNUAL_VACATION`。

## 7. 前端边界情况

- 用户未登录：保持现有 failure 行为，不发 balance 请求。
- Annual vacation balance API 失败：阻止提交，显示 concise error。
- Balance remaining = 0：阻止提交。
- Balance remaining = 1，但用户选择一整个月 range：允许提交。
- Annual vacation 不使用 sick availability map；切换离开 `SICK` 要清空 sick availability。
- 从 `SICK` 切到 `ANNUAL_VACATION`：应隐藏 time input，取消 sick helper，加载 annual balance。
- 从 `ANNUAL_VACATION` 切回 personal leave：恢复普通 leave 行为。
- Review/My Applications/History 卡片要显示 `Annual Vacation`，不要直接暴露 `ANNUAL_VACATION` 给用户。
- 旧数据中如果出现未知 leaveType/status：保留原 string 显示或 fallback，不崩溃。

## 8. 前端开发任务拆分

1. 新增 annual vacation model 与 request/service 方法。
2. 扩展 leave type label helper：`SICK`、`personalleave`、`ANNUAL_VACATION`。
3. 更新 `NewApplication.tsx` leave type options、annual balance fetch、submit guard、full-day payload。
4. 更新 `util/leaveDateAvailability.ts`，确保 annual vacation 只使用 past-date disable，不使用 sick scheduled-date disable。
5. 更新 application cards 的 leave type display label。
6. 扩展 `constants/ShiftStatus.ts` annual vacation status、manual option、non-worked、颜色。
7. 更新 `ShiftRequest`/`ShiftService` annual vacation quota request。
8. 更新 `ShiftDetailModal`，加载 annual quota，锁定/确认 annual vacation status action。
9. 更新 `ShiftCell` status display color/detail text。
10. 写 focused Jest tests。

## 9. 前端验证建议

Focused tests：

```bash
TMPDIR=/Users/marktwain/Projects/OPBOA/.jest-tmp npx jest components/__tests__/LeaveDateAvailabilityRules-test.js components/__tests__/NewApplicationHelperText-test.js components/__tests__/ShiftStatus-test.js components/__tests__/ShiftCellStatusDetail-test.js --runInBand --watchAll=false
```

新增测试建议：

- `AnnualVacationBalanceRequest-test.js`
- `NewApplicationAnnualVacation-test.js`
- `ShiftDetailModalAnnualVacation-test.js`
- `ApplicationCardAnnualVacationLabel-test.js`

Known caveat：README 已记录 `npx tsc --noEmit` 存在 unrelated pre-existing errors；实现时优先跑 annual vacation focused Jest，再视情况跑全量 typecheck。
