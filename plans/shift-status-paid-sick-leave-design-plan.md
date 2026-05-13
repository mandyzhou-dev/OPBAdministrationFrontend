# Shift 状态与 Paid Sick Leave Quota 最小化设计计划

日期：2026-05-13

关联背景文档：

- `/Users/marktwain/Projects/OPBOA/plans/system-tuning-precheck-overview.md`

范围：

- 前端：`/Users/marktwain/Projects/OPBOA`
- 后端：`/Users/marktwain/Projects/OPBAdministrationBackend`

当前阶段只做设计计划，不写业务代码，不改数据库，不执行 SQL。

## 1. 需求确认

本次需求是在 Schedule 的 shift cell 现有交互上增加 Manager-only 的状态标记能力：

- Mark as no show
- Mark as paid sick leave
- Mark as unpaid sick leave

状态变更必须有确认 modal。只有用户点击 Yes 后才提交。

颜色要求：

- `no show`：cell 灰色。
- `unpaid sick leave`：cell 灰色。
- `paid sick leave`：cell 淡紫色。
- 员工端也能看到颜色状态。
- 只有 Manager 能看到和使用状态变更操作。

Statistics 要求：

- 统计 worked hours 时，`no show`、`paid sick leave`、`unpaid sick leave` 对应 shift 时长全部排除。

Paid sick leave quota 口径：

- 按 BC 规则，员工结束 90 天试用期后，每 calendar year 有 5 天 paid sick leave。
- 试用期逻辑已存在，优先复用。
- quota 按 calendar day 计算。同一员工同一天多个 paid sick leave shift 只消耗 1 天额度。
- Manager 在 shift cell 的现有时间调整界面中应看到已用 `X/5`。
- 如果员工仍在 probation，paid sick leave hardlock，并提示 not eligible/probation。
- 如果员工已用完 5 天，paid sick leave hardlock；但如果目标 shift 所在 calendar day 已经被该员工当年其他 shift 计为 paid sick leave，则允许继续标记同一天的其他 shift，因为不会新增消耗。
- no show 和 unpaid sick leave 不受 quota/probation 限制。

产品判断：

- 建议加入最小化的 `Mark as active / Reset status` 操作。原因：没有恢复入口会导致 Manager 一次误点后只能通过改数据库或隐式修改 shift 时间恢复，操作成本和风险都高。

## 2. 当前代码依据

### 2.1 前端现状

关键文件：

- `components/shift/ScheduleTable.tsx`
- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`
- `components/FreeStyle/RequiredFormControl.tsx`
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `model/Shift.ts`
- `util/useAuth.ts`

现状：

- Schedule 使用 `ScheduleTable` 加载一周排班。
- `ShiftCell` 按员工渲染 `Badge`，点击后调用 `ShiftDetailModal`。
- 当前 `ShiftCell` 只有 `canEdit` 才会打开详情 modal。`canEdit` 包含 Manager 和部分 team_leader 窗口规则。
- `ShiftDetailModal` 已有修改时间、修改 group、删除 shift 功能。
- 删除已有 Gluestack `AlertDialog` 确认流程，可复用为状态变更确认。
- 项目已有 Gluestack `Select` 示例：`components/FreeStyle/RequiredFormControl.tsx` 和 `app/(tabs)/target/index.tsx`。
- `model/Shift.ts` 已有 `status` 字段。
- `request/ShiftRequest.ts` 已有 `modifyCurrentShift`，但它会提交完整 shift，并且前端 `modifyShift()` 当前强制把 `currentShift.status = "active"`。

### 2.2 后端现状

关键文件：

- `src/main/java/ca/openbox/shift/dataobject/ShiftArrangementDO.java`
- `src/main/java/ca/openbox/shift/entities/ShiftArrangement.java`
- `src/main/java/ca/openbox/shift/dto/ShiftArrangementDTO.java`
- `src/main/java/ca/openbox/shift/controller/ShiftArrangementController.java`
- `src/main/java/ca/openbox/shift/service/ShiftArrangementService.java`
- `src/main/java/ca/openbox/shift/repository/ShiftArrangementRepository.java`
- `src/main/java/ca/openbox/shift/presentation/ShiftPresentation.java`
- `src/main/java/ca/openbox/shift/repository/ShiftPresentationRepository.java`
- `src/main/java/ca/openbox/statistics/presentor/WorkTimeStatisticsPresentor.java`
- `src/main/java/ca/openbox/user/service/UserService.java`

现状：

- `ShiftArrangementDO` 已映射 `status` 字段。
- `ShiftArrangementDTO` 已包含 `status` 字段。
- 批量创建 shift 时默认写入 `active`。
- `modifyCurrentShift` 当前可保存完整 `ShiftArrangementDTO`。
- `ShiftPresentation` 当前没有 `status` 字段。
- `ShiftPresentationRepository` native query 当前只选择 id/username/userRealName/groupName/start/end，没有选择 status。
- schedule 查询当前过滤 `status in ('active', 'cancelled')`。如果直接新增新状态但不改查询，员工端和经理端都看不到被标记的 shift，也无法显示颜色。
- `WorkTimeStatisticsPresentor` 目前使用 `shiftPresentationRepository.getByTimeScope()` 计算 worked hours，当前查询也只返回 active/cancelled。
- `UserService.isInProbation(username)` 已存在，基于 `User.bigDay + PROBATION_MONTHS`。
- `src/main/resources/ddl/shift_schema.sql` 显示 `status varchar(32) comment 'active | cancelled'`，长度足够容纳建议的新状态值。

## 3. 方案比较

### 方案 A：复用 `shift.status`，新增状态 API 和 quota 查询 API

内容：

- 继续使用 `opb_shift_arrangement.status`。
- 新增小 DTO 和专用状态更新 endpoint。
- 新增 quota 查询 endpoint。
- schedule projection 返回 status。
- statistics 排除三个非 worked 状态。
- 前端在现有 `ShiftDetailModal` 中增加 Select、quota 提示、确认 dialog。

优点：

- 改动最小。
- 不需要新表或新字段。
- 与现有 ShiftArrangement 架构一致。
- 可直接满足颜色、统计、quota、恢复操作。

缺点：

- 状态变更缺少审计字段，例如谁改的、什么时候改的、原因。
- 当前后端认证没有强 JWT filter，Manager-only 只能在当前架构下做到前端限制 + 后端基于传入 operatorUsername 的角色校验，安全性有限。

### 方案 B：新增 sick leave/attendance 表

内容：

- 新增 attendance exception 表记录状态、操作人、操作时间、原因。
- shift 仍保持 active。
- schedule/统计通过 join 计算状态。

优点：

- 审计和历史追踪更完整。
- 能支持原因、附件、审批等未来扩展。

缺点：

- 需要 SQL、迁移、更多后端读写逻辑。
- 超出“最小化改动”和“优先复用 status 字段”的要求。

### 方案 C：只用现有 `modifyCurrentShift` 更新完整 shift

内容：

- 前端把 `status` 改掉后调用现有 `/modifyCurrentShift`。

优点：

- API 改动最少。

缺点：

- 容易意外覆盖 start/end/groupName。
- paid sick leave quota 无法在后端集中校验。
- 权限边界不清楚。
- 不利于以后把状态规则和时间修改规则分开。

推荐：方案 A。

## 4. 状态模型设计

继续复用 `opb_shift_arrangement.status`。

建议状态值：

| 状态值 | UI 文案 | 是否 worked hours | 颜色 | 说明 |
| --- | --- | --- | --- | --- |
| `active` | Mark as active / Reset status | 是 | 现有颜色 | 默认状态，也是恢复状态 |
| `cancelled` | 现有兼容状态 | 维持现状 | 现有颜色或后续单独定义 | 当前查询已兼容，非本次需求重点 |
| `no_show` | Mark as no show | 否 | 灰色 | 员工未到 |
| `paid_sick_leave` | Mark as paid sick leave | 否 | 淡紫色 | 计入 paid sick leave quota |
| `unpaid_sick_leave` | Mark as unpaid sick leave | 否 | 灰色 | 不计入 paid sick leave quota |

选择 lower snake_case 的原因：

- 当前已有 `active`、`cancelled` 是小写。
- 前端/后端字符串比较简单。
- 长度均小于 32，不需要调整 `status varchar(32)`。

建议补充前端常量：

- `constants/ShiftStatus.ts`
- 定义 status value、label、颜色、是否可计 worked hours、是否需要 quota。

建议补充后端常量/enum：

- 最小方案可用 `Set<String>` 放在 `ShiftArrangementService` 中校验。
- 更清晰的方案是新增 `ShiftStatus` enum，但 JPA 仍保存 String，不改变 DB。

## 5. 前端设计

### 5.1 组件边界

最小化修改文件：

- `model/Shift.ts`
- `constants/ShiftStatus.ts`，新增。
- `request/ShiftRequest.ts`
- `service/ShiftService.ts`
- `components/shift/ShiftCell.tsx`
- `components/shift/ShiftDetailModal.tsx`

可选新增轻量组件：

- `components/shift/ShiftStatusSelect.tsx`
- `components/shift/ShiftStatusConfirmDialog.tsx`

如果保持文件少，可直接写在 `ShiftDetailModal.tsx` 内；但从 SRP 看，状态 select 和确认 dialog 独立成组件更清晰。

### 5.2 ShiftCell 颜色显示

`ShiftCell` 现在用 Gluestack `Badge action={worker.groupName=="surrey"?"success":"warning"}`。

建议改为：

- 保留 groupName 默认色逻辑作为 `active/cancelled` 的 fallback。
- 对 `no_show` 和 `unpaid_sick_leave` 使用灰色背景。
- 对 `paid_sick_leave` 使用淡紫色背景。
- Badge 内可选显示一个短状态文本，例如 `No show` / `Paid sick` / `Unpaid sick`。如果担心 UI 拥挤，先只显示颜色，状态在 detail modal 中显示。

员工端可见颜色的关键：

- 后端 schedule projection 必须返回 status。
- `ShiftCell` 不能只在 Manager 模式才读取 status。
- `callModals` 可以保持只有 Manager 才打开操作，但 cell 渲染颜色对所有用户生效。

权限建议：

- 本功能要求只有 Manager 能操作，不是 team_leader。
- 不应复用 `canEdit` 控制状态操作，因为 `canEdit` 允许特定窗口内的 team_leader。
- 在 `ShiftDetailModal` 中用 `useAuth().isManager` 控制状态 Select 显示。
- `ShiftCell` 点击打开 modal 也建议用 `isManager`，避免 team_leader 看到状态操作。若仍需要 team_leader 修改时间，则应拆成“时间修改 canEdit”和“状态修改 isManager”。最小方案：保留现有 canEdit 打开 modal，但状态区域只在 isManager 下显示。

### 5.3 ShiftDetailModal 状态区

在现有时间和 group 区域下新增 Status 区域：

- 当前状态显示：`Current status: Active / No show / Paid sick leave / Unpaid sick leave`。
- Manager-only 下拉：
  - Mark as active / Reset status
  - Mark as no show
  - Mark as paid sick leave
  - Mark as unpaid sick leave
- 下拉优先复用 Gluestack Select 写法，参考：
  - `components/FreeStyle/RequiredFormControl.tsx`
  - `app/(tabs)/target/index.tsx`
- 对 paid sick leave 选项：
  - 显示 helper：`Paid sick leave used: X/5`
  - 如果 probation：禁用并显示 `Not eligible: employee is still in probation`
  - 如果 quota exhausted 且目标 calendar day 尚未计入：禁用并显示 `Paid sick leave quota used up`
  - 如果目标 calendar day 已经计入，即使 X/5 是 5/5，也允许选择，并提示 `Same calendar day already counted; no extra quota will be used`

注意：Gluestack `SelectItem` 是否支持单项 disabled 需要实现时确认。如果不支持，最小实现可以在 `onValueChange` 中拦截 `paid_sick_leave`，弹/显示错误，并不打开确认 dialog。

### 5.4 确认流程

复用现有删除逻辑中的 Gluestack `AlertDialog`：

- 选择状态后不立即提交。
- 先设置 `pendingStatus`。
- 打开确认 dialog：
  - 标题：`Confirm status change`
  - 内容：`Mark {employee} shift on {date} as {statusLabel}?`
  - paid sick leave 额外提示：
    - `Used X/5 paid sick leave days this year.`
    - 如果同一天已计入：`This calendar day is already counted; no extra quota will be used.`
  - Cancel：关闭 dialog，不提交。
  - Yes：调用状态更新 API。

成功后：

- 关闭 confirm dialog。
- 关闭或保留 detail modal 均可。建议关闭 detail modal 并触发 `onClose()` 重新加载 schedule，和现有删除/修改保持一致。

失败后：

- 在 modal 内显示 Gluestack `Alert` 或 toast。
- 如果后端返回 quota/probation 错误，刷新 quota 后保持 modal 打开。

### 5.5 前端 request/service/model 对接

`model/Shift.ts`：

- 保留 `status` 字段。
- 建议类型收窄为 union：
  - `type ShiftStatus = "active" | "cancelled" | "no_show" | "paid_sick_leave" | "unpaid_sick_leave"`

新增 model：

- `model/PaidSickLeaveQuota.ts`

建议字段：

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

`request/ShiftRequest.ts` 新增：

- `updateShiftStatus(shiftId: number, status: ShiftStatus, operatorUsername: string)`
- `getPaidSickLeaveQuota(shiftId: number, operatorUsername: string)`

`service/ShiftService.ts` 新增薄封装：

- `updateShiftStatus(...)`
- `getPaidSickLeaveQuota(...)`

## 6. 后端设计

### 6.1 API 设计

新增状态更新 API：

```text
PATCH /api/shift/shiftarrangement/{id}/status
```

Request DTO：

```json
{
  "status": "active | no_show | paid_sick_leave | unpaid_sick_leave",
  "operatorUsername": "manager username"
}
```

Response：

```json
{
  "id": 123,
  "username": "employee1",
  "start": "...",
  "end": "...",
  "status": "paid_sick_leave",
  "groupName": "surrey"
}
```

新增 quota 查询 API：

```text
GET /api/shift/shiftarrangement/{id}/paid-sick-leave-quota?operatorUsername=...
```

Response DTO：

```json
{
  "username": "employee1",
  "year": 2026,
  "usedDays": 2,
  "quotaDays": 5,
  "probation": false,
  "eligible": true,
  "targetDateAlreadyCounted": false,
  "canMarkPaidSickLeave": true,
  "message": "Used 2/5"
}
```

说明：

- `year` 和 calendar day 均以 `America/Vancouver` 计算。
- `usedDays` 是当年 distinct paid sick leave calendar day 数。
- `targetDateAlreadyCounted` 表示当前 shift 所在 calendar day 是否已经在当年 quota 中。
- `canMarkPaidSickLeave = eligible && (usedDays < 5 || targetDateAlreadyCounted)`。

### 6.2 DTO

新增 DTO：

- `ShiftStatusUpdateDTO`
  - `String status`
  - `String operatorUsername`
- `PaidSickLeaveQuotaDTO`
  - `String username`
  - `int year`
  - `int usedDays`
  - `int quotaDays`
  - `boolean probation`
  - `boolean eligible`
  - `boolean targetDateAlreadyCounted`
  - `boolean canMarkPaidSickLeave`
  - `String message`

可选后端 enum：

- `ShiftStatus`
  - `ACTIVE("active")`
  - `CANCELLED("cancelled")`
  - `NO_SHOW("no_show")`
  - `PAID_SICK_LEAVE("paid_sick_leave")`
  - `UNPAID_SICK_LEAVE("unpaid_sick_leave")`

### 6.3 Controller 边界

`ShiftArrangementController` 新增：

- `patchStatus(@PathVariable Integer id, @RequestBody ShiftStatusUpdateDTO dto)`
- `getPaidSickLeaveQuota(@PathVariable Integer id, @RequestParam String operatorUsername)`

Controller 只负责：

- 接收参数。
- 调用 service。
- 返回 DTO。

所有业务校验放在 `ShiftArrangementService`。

### 6.4 Service 边界

`ShiftArrangementService` 新增方法：

- `updateStatus(Integer shiftId, String newStatus, String operatorUsername)`
- `getPaidSickLeaveQuota(Integer shiftId, String operatorUsername)`
- `countPaidSickLeaveDays(String username, int year, ZoneId zone)`

Service 校验规则：

1. shift 必须存在。
2. `newStatus` 必须在允许状态内。
3. operator 必须是 Manager。
   - 最小化方案：用 `UserRepository` 或 `UserService` 查询 `operatorUsername`，检查 `roles` 是否包含 `Manager`。
   - 当前项目没有强 JWT filter，这种校验仍可能被伪造；但它比仅前端隐藏更好，且符合现有架构最小改动。
4. 如果 `newStatus == paid_sick_leave`：
   - 调用 `UserService.isInProbation(shift.username)`。
   - probation 为 true 时拒绝。
   - 计算 quota。
   - 如果 `usedDays >= 5` 且目标 shift 所在 calendar day 未被计入，则拒绝。
   - 如果同一 calendar day 已计入，则允许，不新增 quota 消耗。
5. `no_show`、`unpaid_sick_leave`、`active` 不受 quota/probation 限制。

建议异常：

- `IllegalArgumentException` 或新增轻量业务异常：
  - `SHIFT_NOT_FOUND`
  - `INVALID_SHIFT_STATUS`
  - `FORBIDDEN_MANAGER_ONLY`
  - `PAID_SICK_LEAVE_NOT_ELIGIBLE_PROBATION`
  - `PAID_SICK_LEAVE_QUOTA_EXHAUSTED`

若已有全局 exception handler 能统一返回结构，复用现有；否则本计划建议最小化返回 400/403，但实现时再按现有 handler 风格决定。

### 6.5 Repository 边界

`ShiftArrangementRepository` 建议新增：

- `Optional<ShiftArrangementDO> findById(Integer id)` 已由 JpaRepository 提供。
- `List<ShiftArrangementDO> getShiftArrangementDOByUsernameAndStatusAndStartBetween(String username, String status, ZonedDateTime start, ZonedDateTime end)`

Quota 计算流程：

1. 以 Vancouver 时区确定目标 shift 的 year。
2. 计算该 year 的 `[yearStart, nextYearStart)`，转换为 UTC/instant 兼容现有存储方式。
3. 查询该员工当年 status 为 `paid_sick_leave` 的 shifts。
4. 在 Java 中按 `shift.start.withZoneSameInstant(ZoneId.of("America/Vancouver")).toLocalDate()` 去重计数。
5. 判断目标 shift date 是否已在这个 date set 内。

这样不需要依赖 MySQL `CONVERT_TZ` 或数据库 timezone table。

### 6.6 ShiftPresentation 查询调整

为了让员工也能看到颜色状态，需要：

- `ShiftPresentation` 增加 `status` 字段。
- `ShiftPresentationRepository` 的 native select 增加 `opb_shift_arrangement.status as status`。
- schedule 相关查询状态范围从 `active,cancelled` 扩展为：
  - `active`
  - `cancelled`
  - `no_show`
  - `paid_sick_leave`
  - `unpaid_sick_leave`

注意：这是读模型调整，不是数据库结构调整。

## 7. Statistics 设计

当前 `WorkTimeStatisticsPresentor` 通过 `shiftPresentationRepository.getByTimeScope(start, end)` 聚合工时。

本次需求要求排除：

- `no_show`
- `paid_sick_leave`
- `unpaid_sick_leave`

最小化方案：

- 在 `ShiftPresentation` 返回 status 后，`WorkTimeStatisticsPresentor` 循环中先判断：
  - 如果 status 在 non-worked set 中，`continue`。
- 保留现有 lunch deduction 逻辑不变。
- 保留现有 `cancelled` 行为不变，避免扩大业务变化。如果产品希望 `cancelled` 也不算 worked hours，需要另行确认。

可选更清晰方案：

- 为统计新增 repository method，例如 `getWorkedByTimeScope`，只返回需要计入 worked hours 的状态。
- 但这会让 schedule 和 statistics 查询分叉。当前需求最小化实现更适合在 presentor 中显式过滤 non-worked statuses。

## 8. Paid Sick Leave Quota 计算设计

### 8.1 年度和日期口径

- 使用 `America/Vancouver` 作为 calendar day 和 calendar year 口径。
- 同一天多段 shift 的 paid sick leave 只算一个 `LocalDate`。
- 如果某 shift 跨日，quota 按 shift start 所在 Vancouver calendar day 计算。该规则最小、稳定、与现有排班按 start 日期展示一致。

### 8.2 Eligibility

- 复用 `UserService.isInProbation(username)`。
- 该方法当前逻辑：
  - user 不存在：视为 probation。
  - `bigDay == null`：视为 probation。
  - `bigDay + PROBATION_MONTHS` 晚于当前日期：probation。
- 因此 bigDay 缺失的员工会被 hardlock paid sick leave。

### 8.3 计数示例

示例 1：

- 员工 2026 年已有 paid sick leave dates：Jan 10、Mar 5。
- Manager 打开 Apr 1 shift。
- 显示 `Used 2/5`，paid sick leave 可选。

示例 2：

- 员工 2026 年已有 5 个 paid sick leave calendar days。
- Manager 打开一个全新日期的 shift。
- 显示 `Used 5/5`，paid sick leave disabled。

示例 3：

- 员工 2026 年已有 5 个 paid sick leave calendar days，其中 May 13 已计入。
- Manager 打开 May 13 同员工第二个 shift。
- 显示 `Used 5/5 - this day already counted`，paid sick leave 仍可选，因为不会新增 quota 消耗。

示例 4：

- 员工仍在 probation。
- 显示 `Not eligible: probation`，paid sick leave disabled。
- no show/unpaid sick leave/active 可用。

## 9. 权限控制设计

前端：

- 状态操作 UI 只对 `useAuth().isManager` 显示。
- 员工端和 team_leader 不显示状态下拉。
- 员工端仍根据 `shift.status` 显示颜色。

后端：

- 状态更新和 quota 查询都要求 `operatorUsername` 对应用户角色包含 `Manager`。
- 当前项目没有强 JWT filter；这不是完整安全方案。
- 如果后续要严格安全，应单独做 JWT filter、Authorization header、后端从 token 取 username/roles，不再信任 body/query 中的 `operatorUsername`。这会超出本次最小化改动。

## 10. 数据库与 SQL 判断

结论：按当前最小化方案，不需要 SQL。

理由：

- 现有 `opb_shift_arrangement` 已有 `status` 字段。
- JPA `ShiftArrangementDO.status` 已存在。
- `ShiftArrangementDTO.status` 已存在。
- DDL 片段显示 `status varchar(32)`，建议状态值均小于 32：
  - `no_show`
  - `paid_sick_leave`
  - `unpaid_sick_leave`
  - `active`
- Quota 可通过查询现有 shift rows 并按 Java `LocalDate` 去重计算，不需要新表。
- 不新增字段、约束、索引、迁移数据。

需要进一步确认：

- 生产数据库中的 `opb_shift_arrangement.status` 是否确实为可容纳这些值的字符串字段，且长度不少于 17。
- 生产数据库是否已有不同于 DDL 片段的 status enum/check constraint。如果存在 enum/check，需要用户提供 schema；那时才需要 SQL。

当前不提供 SQL，因为设计判断不需要改表。

## 11. 测试与验证建议

### 11.1 前端手工验证

Manager：

1. 打开 Schedule，点击某个 active shift。
2. 能看到状态下拉和 paid sick leave quota `X/5`。
3. 选择 no show，弹确认，Cancel 不提交，Yes 后 cell 变灰。
4. 选择 unpaid sick leave，弹确认，Yes 后 cell 变灰。
5. 选择 paid sick leave，弹确认，Yes 后 cell 变淡紫。
6. 选择 Mark as active / Reset status，确认后恢复默认颜色。
7. quota 用完时 paid sick leave 选项不可用。
8. 同一员工同一天第二个 shift 可继续标记 paid sick leave，提示不重复扣额度。
9. probation 员工 paid sick leave 不可用，但 no show/unpaid 可用。

Employee：

1. 打开 Schedule，可看到灰色/淡紫色 cell。
2. 点击 cell 不显示状态变更操作。

Team leader：

1. 如果仍保留时间调整权限，只能看到原有时间/group 操作，看不到状态操作。
2. 如果产品决定状态 modal 仅 Manager 可打开，team_leader 不可进入状态操作。

### 11.2 后端验证

建议新增或手工验证：

1. `PATCH /shift/shiftarrangement/{id}/status` 可把 active 改为 no_show。
2. 非 Manager operator 被拒绝。
3. invalid status 被拒绝。
4. paid sick leave 对 probation 员工被拒绝。
5. paid sick leave 对 usedDays < 5 员工成功。
6. paid sick leave 对 usedDays = 5 且目标日期未计入时被拒绝。
7. paid sick leave 对 usedDays = 5 且目标日期已计入时成功。
8. `GET /paid-sick-leave-quota` 对同一天多 shift 只计 1 天。
9. schedule 查询能返回新状态的 shifts。
10. statistics 不累计 no_show/paid_sick_leave/unpaid_sick_leave 的分钟数。

### 11.3 回归风险验证

1. 批量创建 shift 仍默认 active。
2. 修改 shift 时间不应意外清掉已有 paid/no_show/unpaid 状态，除非用户明确 Reset status。
3. 删除 shift 仍可用。
4. KPI 计算如果依赖 shift hours，需要确认是否也应排除这些状态。本次需求只明确 Statistics worked hours；KPI 是否排除需用户确认。

## 12. 风险与注意事项

1. 当前 `modifyShift()` 会强制 `currentShift.status = "active"`。如果实现时不改，会导致 Manager 修改时间时意外把 no_show/paid/unpaid 状态重置。建议改为保留当前状态，只有 Reset status 操作才写 active。
2. `ShiftPresentationRepository` 当前查询没有 status，且只返回 active/cancelled。必须调整，否则新状态不可见。
3. 统计目前复用 schedule query。调整 schedule query 后，如果统计不显式过滤 non-worked statuses，会把非 worked shift 算进去。
4. 当前后端权限不是强认证架构。最小方案可以校验 operatorUsername 的 roles，但不是完整安全方案。
5. `UserService.isInProbation` 对 `bigDay == null` 返回 true，会 hardlock paid sick leave。需要用户确认这符合 HR 数据现状。
6. `cancelled` 是否应算 worked hours 当前不改。若用户认为 cancelled 也不该算，需要单独确认。
7. Quota 按 shift start 的 Vancouver calendar day 计算。如果未来有跨午夜 shift，需要确认是否仍按 start day。
8. 如果生产 DB 对 `status` 有 enum/check constraint，虽然代码和 DDL 片段看不出来，但实际会需要 SQL；目前需用户或 DBA 确认生产 schema。

## 13. 建议实施步骤

1. 前后端共同确认状态值：`active`、`no_show`、`paid_sick_leave`、`unpaid_sick_leave`。
2. 后端先扩展 projection 返回 status，并增加状态更新/quota API。
3. 后端实现 paid sick leave quota 计算和 service 级校验。
4. 后端调整 statistics 过滤 non-worked statuses。
5. 前端扩展 `Shift` model、request/service。
6. 前端在 `ShiftDetailModal` 增加 Manager-only 状态 Select、quota 提示、确认 AlertDialog。
7. 前端在 `ShiftCell` 根据 status 显示灰色/淡紫色。
8. 完成手工验证和必要测试。

## 14. 需要用户确认的问题

1. 是否确认加入 `Mark as active / Reset status`？我的建议是加入，否则误操作无法自助恢复。
2. `cancelled` 是否继续按现有行为处理，还是也应从 worked hours 中排除？
3. KPI 计算是否也应该排除 no_show/paid_sick_leave/unpaid_sick_leave？当前需求只明确 Statistics worked hours。
4. `bigDay == null` 的员工是否应视为 probation/not eligible？当前复用逻辑会这样处理。
5. 跨午夜 shift 的 paid sick leave quota 是否按 shift start 所在 calendar day 计算？建议按 start day。
6. 生产数据库 `status` 字段是否为普通 varchar 且长度不少于 17，是否无 enum/check constraint？
