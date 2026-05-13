# Frontend Plan: Shift Status and Paid Sick Leave UI

日期：2026-05-13

项目目录：`/Users/marktwain/Projects/OPBOA`

当前阶段只做前端计划，不写业务代码，不操作数据库。

## 1. 最终产品口径

用户和 PM 已确认：

- Manager 在 Schedule 点击具体 shift cell 后，在现有时间调整界面上增加状态下拉。
- 本次只允许 Manager 标记 3 个目标状态：
  - `no_show`
  - `paid_sick_leave`
  - `unpaid_sick_leave`
- 不加入 `Mark as active / Reset status`。
- 选择任何状态后必须弹确认 modal，只有点击 Yes 后才提交。
- no show：cell 变灰色。
- unpaid sick leave：cell 变灰色。
- paid sick leave：cell 变淡紫色。
- 员工端可见颜色状态，但不能操作。
- paid sick leave quota 按 America/Vancouver calendar day 计算。
- 同一员工同一天多个 paid sick leave shift 只消耗 1 天 quota。
- probation 员工 paid sick leave hardlock；no show / unpaid sick leave 不受 probation 限制。
- `bigDay == null` 按 probation / not eligible 处理。
- `cancelled`、`no_show`、`paid_sick_leave`、`unpaid_sick_leave` 都是 non-worked 状态。
- worked hours statistics 和 KPI 都由后端排除 non-worked 状态；前端只展示后端结果。
- 生产库 `status` 已确认为普通 `varchar(32)`，无 enum/check constraint；前端不涉及 SQL。

## 2. 前端现状

关键文件：

- `components/shift/ScheduleTable.tsx`
- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `components/FreeStyle/RequiredFormControl.tsx`
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `model/Shift.ts`
- `util/useAuth.ts`

现状说明：

- `ScheduleTable` 加载一周排班，并将每天的 `workers` 和 `shifts` 传给 `ShiftCell`。
- `ShiftCell` 使用 Gluestack `Badge` 展示员工和时间，点击后打开 `ShiftDetailModal`。
- `ShiftDetailModal` 已有修改时间、修改 group、删除 shift 的 modal UI。
- 删除 shift 已使用 Gluestack `AlertDialog` 做确认流程，可复用为状态变更确认。
- 项目已有 Gluestack `Select` 范例：
  - `components/FreeStyle/RequiredFormControl.tsx`
  - `app/(tabs)/target/index.tsx`
- `model/Shift.ts` 已有 `status` 字段。
- `request/ShiftRequest.ts` 当前已有修改/删除 shift 请求，但没有专用 status API。
- 当前 `ShiftDetailModal.modifyShift()` 会强制 `currentShift.status = "active"`；实现时必须移除这个副作用，时间/group 修改应保留原 status。

## 3. 前端改动边界

计划新增或修改：

- `constants/ShiftStatus.ts`：新增状态常量、UI label、颜色、non-worked 集合。
- `model/Shift.ts`：补充/收窄 status 类型。
- `model/PaidSickLeaveQuota.ts`：新增 quota response 类型。
- `request/ShiftRequest.ts`：新增 status update 和 quota 查询请求。
- `service/ShiftService.ts`：新增 request 薄封装。
- `components/shift/ShiftCell.tsx`：根据 status 显示颜色；员工也可见颜色。
- `components/shift/ShiftDetailModal.tsx`：Manager-only 状态下拉、quota 提示、确认 dialog、错误提示。

可选新增轻量组件：

- `components/shift/ShiftStatusSelect.tsx`
- `components/shift/ShiftStatusConfirmDialog.tsx`

不在前端计划内：

- 不提供 Reset status 操作。
- 不直接改数据库。
- 不在前端自行计算 authoritative quota，前端只展示后端 quota 结果并做 UI hardlock。
- 不在前端计算 worked hours / KPI 排除逻辑，前端展示后端返回值。

## 4. 状态与数据模型

前端推荐状态类型：

```ts
export type ShiftStatus =
  | "active"
  | "cancelled"
  | "no_show"
  | "paid_sick_leave"
  | "unpaid_sick_leave";
```

说明：

- `active` / `cancelled` 仍需要作为显示和兼容状态存在。
- 本次状态下拉只提供 3 个可提交目标：`no_show`、`paid_sick_leave`、`unpaid_sick_leave`。
- 不提供 `active` reset 入口。

`constants/ShiftStatus.ts` 建议内容：

- `SHIFT_STATUS`
- `SHIFT_STATUS_LABELS`
- `SHIFT_STATUS_ACTION_OPTIONS`
- `NON_WORKED_SHIFT_STATUSES`
- `SHIFT_STATUS_COLORS`

UI action options：

- `no_show` -> `Mark as no show`
- `paid_sick_leave` -> `Mark as paid sick leave`
- `unpaid_sick_leave` -> `Mark as unpaid sick leave`

Non-worked statuses：

- `cancelled`
- `no_show`
- `paid_sick_leave`
- `unpaid_sick_leave`

颜色建议：

- `no_show`：灰色，例如 `#9CA3AF` 或 Gluestack gray token。
- `unpaid_sick_leave`：灰色，和 no show 一致。
- `paid_sick_leave`：淡紫色，例如 `#DDD6FE`。
- `active`：保留现有 groupName badge 逻辑。
- `cancelled`：若当前已有显示风格则保持；否则可按灰色处理，但不新增操作入口。

新增 quota model：

```ts
export interface PaidSickLeaveQuota {
  username: string;
  year: number;
  usedDays: number;
  quotaDays: number;
  probation: boolean;
  eligible: boolean;
  targetDateAlreadyCounted: boolean;
  canMarkPaidSickLeave: boolean;
  message?: string;
}
```

## 5. Schedule / ShiftCell 设计

### 5.1 ScheduleTable

保持现有职责：

- 加载一周排班。
- 控制当前周。
- reload 时重新请求后端。

状态变更成功后：

- `ShiftDetailModal` 调用传入的 `onClose()`。
- `ScheduleTable.reload()` 增加 `refreshCount`，重新加载 schedule。
- 重新加载后，cell 颜色以最新 `shift.status` 为准。

### 5.2 ShiftCell

计划调整：

- 从 `shifts.get(worker.username)` 读取 `status`。
- 根据 status 计算 badge style。
- 对所有用户渲染状态颜色。
- 状态颜色不依赖 Manager 权限。

点击行为：

- 当前代码使用 `useAuth().canEdit` 控制是否打开 modal。
- 状态操作必须只用 `useAuth().isManager` 控制。
- 最小化方案：
  - `ShiftCell` 可继续用 `canEdit` 打开 `ShiftDetailModal`，避免破坏现有 team_leader 时间编辑。
  - `ShiftDetailModal` 内的状态操作区域只对 Manager 显示。
  - 员工端不打开状态操作，只看颜色。

## 6. ShiftDetailModal 设计

### 6.1 Manager-only 状态区

在现有时间和 group 编辑区下方增加 Status 区域。

只在 `useAuth().isManager === true` 时显示：

- 当前状态文本：`Current status: Paid sick leave`。
- quota helper：`Paid sick leave used: X/5`。
- Gluestack Select 下拉：
  - Mark as no show
  - Mark as paid sick leave
  - Mark as unpaid sick leave

Select 范例来源：

- `components/FreeStyle/RequiredFormControl.tsx`
- `app/(tabs)/target/index.tsx`

### 6.2 Paid sick leave hardlock

当 modal 打开且当前用户是 Manager：

1. 调用后端 quota API。
2. 保存 `quota` 到 modal local state。
3. 根据 quota 控制 paid sick leave option。

禁用条件：

- `quota.probation === true`
- 或 `quota.canMarkPaidSickLeave === false`

提示文案：

- probation：`Not eligible: employee is still in probation`
- quota exhausted：`Paid sick leave quota used up`
- same day counted：`This calendar day is already counted; no extra quota will be used`
- normal：`Paid sick leave used: X/5`

如果 Gluestack `SelectItem` 不支持单项 disabled：

- 在 `onValueChange` 中拦截 `paid_sick_leave`。
- 如果不可选，显示 Alert，不打开确认 dialog，不提交。

### 6.3 确认 modal

复用现有 Gluestack `AlertDialog` 模式。

状态流：

1. 用户从 Select 选择一个 status。
2. 前端设置 `pendingStatus`。
3. 打开 confirm dialog。
4. Cancel：清空 `pendingStatus`，不请求后端。
5. Yes：调用 `updateShiftStatus()`。
6. 成功：关闭 dialog，关闭或刷新 modal，调用 `onClose()` 触发 Schedule reload。
7. 失败：显示错误 Alert，保留 modal，必要时刷新 quota。

确认文案：

- 标题：`Confirm status change`
- 内容：`Mark {employeeName} shift on {date} as {statusLabel}?`
- paid sick leave 额外显示 quota 信息。

### 6.4 修改时间时保留 status

实现时必须修正现有风险：

- 当前 `modifyShift()` 会执行 `currentShift.status = "active"`。
- 后续修改时间/group 时应保留当前 status。
- 因最终口径不提供 Reset status，前端不应通过时间/group 修改把 status 改回 active。

## 7. Request / Service 对接

需要调用的后端 API：

```text
PATCH /api/shift/shiftarrangement/{id}/status
GET /api/shift/shiftarrangement/{id}/paid-sick-leave-quota?operatorUsername=...
```

`request/ShiftRequest.ts` 新增方法：

```ts
updateShiftStatus = async (
  shiftId: number,
  status: "no_show" | "paid_sick_leave" | "unpaid_sick_leave",
  operatorUsername: string
): Promise<Shift> => { ... }

getPaidSickLeaveQuota = async (
  shiftId: number,
  operatorUsername: string
): Promise<PaidSickLeaveQuota> => { ... }
```

`service/ShiftService.ts` 新增薄封装：

```ts
export const updateShiftStatus = async (...) => ...
export const getPaidSickLeaveQuota = async (...) => ...
```

operatorUsername 来源：

- 从 `useAuth().username` 或 `user.username` 读取当前登录用户。
- 前端只显示给 Manager；后端也会校验 Manager。

错误处理：

- 403/manager-only：显示 `Only Manager can change shift status.`
- probation：显示 `Not eligible: employee is still in probation.`
- quota exhausted：显示 `Paid sick leave quota used up.`
- invalid status：显示通用错误。
- 网络错误：显示 `Failed to update shift status. Please try again.`

## 8. 员工只读颜色可见

依赖后端 schedule projection 返回 `status`。

前端行为：

- 员工端 Schedule 正常加载可见 shifts。
- `ShiftCell` 对所有用户根据 status 设置颜色。
- 员工端不显示状态下拉、quota、确认 dialog。
- 员工端不调用状态更新 API。

## 9. 前端测试与验证点

Manager：

1. 打开 Schedule，点击 active shift，能看到 3 个状态选项和 quota `X/5`。
2. 下拉中不出现 `Mark as active / Reset status`。
3. 选择 no show 后弹确认；Cancel 不提交；Yes 后刷新，cell 变灰。
4. 选择 unpaid sick leave 后弹确认；Yes 后刷新，cell 变灰。
5. 选择 paid sick leave 后弹确认；Yes 后刷新，cell 变淡紫。
6. paid sick leave quota 用完且目标日期未计入时，选项 hardlock。
7. 同一员工同一天第二个 shift，即使显示 5/5，只要当天已计入，也允许标记 paid sick leave，并提示不重复扣额度。
8. probation 员工 paid sick leave hardlock，但 no show/unpaid sick leave 可选。
9. 修改时间/group 不应意外把 status 重置为 active。

Employee：

1. 能看到灰色/淡紫色 cell。
2. 不能看到状态下拉和 quota 操作。
3. 不能触发状态更新。

Team leader：

1. 若仍保留现有 canEdit 行为，可继续做原有时间调整。
2. 不显示状态下拉、quota、状态确认 dialog。

Regression：

1. Copy This Week To... 仍可打开和执行。
2. Schedule 上一周/下一周/刷新正常。
3. WorkTimeStatisticList 和 KPI 页面展示后端更新后的统计/KPI 结果。

## 10. 风险与剩余问题

前端风险：

- `ShiftPresentation` 当前后端不返回 status；若后端不改，前端无法显示颜色。
- Gluestack Select 单项 disabled 能力需要实现时确认；不支持时用 onValueChange 拦截。
- `ShiftDetailModal` 已经承担时间、group、删除逻辑，加入状态后可能变大；建议必要时拆组件。
- 现有 `canEdit` 包含 team_leader，状态操作必须单独用 `isManager`。

已确认，不再作为待确认项：

- 不加入 Reset status。
- cancelled 从 worked hours 排除。
- KPI 排除 non-worked 状态。
- `bigDay == null` 按 probation/not eligible。
- 业务日期和 quota 按 America/Vancouver。

剩余实现期需要确认的非阻塞 UI 细节：

1. 状态 badge 是否需要显示文字标签，还是只显示颜色。
2. paid sick leave hardlock 是否必须视觉上单项灰色 disabled；如果组件不支持，是否接受拦截并显示错误提示。
