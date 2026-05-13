# 系统微调前项目梳理

日期：2026-05-13

范围：

- 前端：`/Users/marktwain/Projects/OPBOA`
- 后端：`/Users/marktwain/Projects/OPBAdministrationBackend`

本文件只做现状梳理和后续微调前的确认清单，不包含代码实现、不包含数据库变更执行。

## 1. 前端项目结构与技术栈

### 1.1 技术栈与启动方式

- 项目类型：Expo + React Native Web + Expo Router。
- 入口：`package.json` 的 `main` 为 `expo-router/entry`。
- 主要依赖：React 18、React Native 0.73、Expo 50、Expo Router、Gluestack UI、React Native Paper、Ant Design、MUI、Axios、Dayjs/Moment、Recharts。
- 启动命令：
  - `npm run start`：Expo dev server。
  - `npm run web`：Web 端运行。
  - `npm run android` / `npm run ios`：移动端运行。
- API base URL 来源：`.env` 中 `EXPO_PUBLIC_API_URL=http://localhost:8080/`。
- TypeScript：`tsconfig.json` 开启 `strict`，路径别名 `@/* -> ./*`。

### 1.2 目录结构

- `app/`：Expo Router 页面与路由。
- `app/(tabs)/`：登录后的主要 Tab 导航。
- `app/applications/`：请假、离职、公告、规章、偏好班期等业务页面。
- `app/tasks/`：排班与统计任务页面。
- `components/`：通用组件和业务组件。
  - `components/shift/`：排班表、班次单元格、复制排班弹窗、班次详情。
  - `components/applications/`：申请卡片、审核卡片、审核弹窗、离职审核卡片。
  - `components/announcements/`：公告卡片、修改/更多/未读弹窗。
  - `components/team/`：员工操作菜单、终止雇佣弹窗、离职模板弹窗。
  - `components/statistics/`：工时统计列表和条目。
- `model/`：前端 TypeScript 数据模型。
- `request/`：Axios 请求封装，直接对应后端 REST API。
- `service/`：页面调用的业务服务层，通常薄封装 `request/*`。
- `util/`：认证状态和日期工具。
- `docs/`：已有功能说明，包含注册补丁和离职申请说明。

### 1.3 主要页面与路由

根布局：`app/_layout.tsx`

- 设置 Gluestack UI Provider。
- 设置 Expo Router Stack。
- 设置 Moment 默认时区为 `America/Vancouver`。
- 注册页面 `register` 以 modal 形式展示。

Tab 布局：`app/(tabs)/_layout.tsx`

- `Schedule`：`app/(tabs)/index.tsx`，展示员工可见排班和未读公告提醒。
- `Assignment`：`app/(tabs)/two.tsx`，进入排班和统计任务。仅在 `useAuth().canEdit` 为 true 时显示。
- `KPI`：`app/(tabs)/target/index.tsx`，经理/组长可看团队或员工 KPI，普通员工看自己的 KPI。
- `Application`：`app/(tabs)/application.tsx`，请假、离职、公告、规章、偏好班期入口。
- `Team`：`app/(tabs)/team/index.tsx`，经理查看员工基础信息、终止雇佣、生成离职模板。
- `My`：`app/(tabs)/my/index.tsx`，登录或个人资料。

其他主要业务页面：

- `app/register.tsx`：注册。
- `app/setPassword.tsx`：设置/重置密码。
- `app/announcement.tsx`、`app/announcementDetail.tsx`：公告列表和详情。
- `app/applications/NewApplication.tsx`：提交请假申请。
- `app/applications/MyApplications.tsx`：我的请假申请。
- `app/applications/ReviewApplications.tsx`：经理审核请假。
- `app/applications/History.tsx`：请假历史。
- `app/applications/NewResignation.tsx`：提交离职申请。
- `app/applications/ResigReq.tsx`：经理查看/审核离职申请。
- `app/applications/NewAnnouncement.tsx`：发布公告。
- `app/applications/Regulations.tsx`：规章内容。
- `app/applications/MyPreferShift.tsx`：员工选择偏好工作日期。
- `app/tasks/assignment.tsx`：排班操作。
- `app/tasks/statistics.tsx`：工时统计。

### 1.4 路由、权限与状态管理

当前前端没有集中式状态管理库，主要依赖：

- `localStorage.getItem("user")` 保存登录响应用户对象。
- `DeviceEventEmitter` 的 `userlogin` 事件通知登录状态变化。
- `util/useAuth.ts` 从 localStorage 读取用户，计算：
  - `canEdit`：经理可编辑；team_leader 仅在下月前 7 天窗口内可编辑。
  - `isManager`：`roles` 包含 `Manager`。
- Tab 可见性通过 `href: null` 隐藏入口实现。
- 页面内也有局部角色判断，例如：
  - `roles === "Manager"`。
  - `roles?.toLowerCase() === "manager"`。
  - `roles.toLowerCase().includes("team_leader")`。

注意：角色字符串大小写和多角色分隔在前端判断中不完全统一。`useAuth` 支持 `roles.split('|')`，但部分页面使用严格等于 `Manager`。

### 1.5 接口调用方式

- 所有请求集中在 `request/*.ts`，通过 Axios 调用。
- URL 组合方式：`process.env.EXPO_PUBLIC_API_URL + 'api/...'`。
- `UserRequest.ts` 全局设置：
  - `axios.defaults.withCredentials = true`
  - 固定 `X-CSRF-TOKEN` header
- 登录后保存完整响应到 localStorage：
  - `service/UserService.ts` 的 `login()` 调用 `localStorage.setItem("user", JSON.stringify(data))`。
- 排班批量创建会额外写入 `JSESSIONID` cookie，但后端当前大多数 endpoint 是 permitAll。

## 2. 后端项目结构与技术栈

### 2.1 技术栈与启动方式

- Spring Boot 3.2.3，Java 17+。
- Maven 项目，入口类：`ca.openbox.Main`。
- 主要依赖：Spring Web、Spring Data JPA/Hibernate、Spring Security、MySQL、JJWT、Jasypt、Lombok、Java Mail。
- 默认配置位置：`Main` 设置 `spring.config.location=file:/etc/openbox/config.yml`。
- `src/main/resources/application.yml` 是模板，包含 datasource、Jasypt mail 配置、JWT secret、`server.servlet.context-path=/api`。
- 构建：`mvn clean package`。
- 运行：`mvn spring-boot:run`。
- 本地配置运行：
  - `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.config.location=file:./src/main/resources/application.yml"`
- 测试：`mvn test`。README 说明当前无 `src/test` 测试源码，主要验证编译。

### 2.2 后端目录结构

- `batch/`：定时任务，例如双周 KPI 刷新。
- `employment/`：雇佣终止记录与用户停用。
- `forum/`：公告和阅读记录。
- `infrastructure/`：邮件、JWT、加密、CORS、应用变量。
- `process/`：请假申请工作流。
- `regulation/`：规章内容。
- `resignation/`：离职申请工作流。
- `shift/`：排班、偏好工作日、KPI、法定假日、复制排班。
- `statistics/`：工时统计。
- `user/`：用户、注册、登录、用户查询。
- `src/main/resources/ddl/`：只包含部分 schema 片段，完整表结构需以 JPA entity 和现有数据库为准。

常见分层：

- `controller`：写操作和业务 REST endpoint。
- `presentor`：读查询 endpoint，通常返回 projection。
- `service`：业务逻辑和事务。
- `application`：跨 service 编排。
- `repository`：Spring Data repository。
- `entities`：领域对象或部分 JPA entity。
- `dataobject`：JPA 持久化对象。
- `dto`：请求/响应 DTO。
- `presentation`：读模型 projection。

### 2.3 主要模块、Controller、Service、Repository

用户模块 `ca.openbox.user`

- Controller：`UserController`
- Presentor：`UserPresentor`
- Service：`UserService`
- Repository：`UserRepository`、`EmailVerificationRepository`、`UserPresentationRepository`
- 功能：登录、邮箱验证码、注册、密码验证、重置密码、修改资料、SIN 加密读写、probation 判断、按角色/组查询用户、员工基础资料。
- 核心数据：
  - `UserDO` -> `opb_user`
  - `EmailVerificationDO` -> `opb_email_verification`
  - `LoginDTO`：`username`、`password`，其中 `username` 实际支持用户名或邮箱。
  - `RegisterDTO`：username/name/password/birthdate/legalname/sinno/address/phoneNumber/email。
  - `UserDTO`：username/name/roles/birthdate/JSessionID/legalname/address/phoneNumber/email/token/active/groupName。

排班与偏好班期 `ca.openbox.shift`

- Controller：`ShiftArrangementController`、`ShiftBoardController`、`StatutoryHolidayController`、`ShiftPresetController`
- Presentor：`ShiftPresentor`
- Service：`ShiftArrangementService`、`EmployeePreferWorkdayBoardService`、`WeekScheduleService`、`StatutoryHolidayService`
- Repository：`ShiftArrangementRepository`、`ShiftPresentationRepository`、`EmployeePreferWorkdayRepository`、`StatutoryHolidayRepository`
- 功能：批量创建班次、删除/修改班次、按用户/日期/可见范围查询班次、员工偏好工作日、月份切换、法定假日、复制周排班。
- 核心数据：
  - `ShiftArrangementDO` -> `opb_shift_arrangement`
  - `EmployeePreferWorkdayDO` -> `opb_employee_prefer_workday`
  - `StatutoryHolidayDO` -> `opb_statutory_holiday`
  - `ShiftArrangementDTO`：id/username/start/end/status/groupName。
  - `BatchCreateShiftByDateDTO`：workDate/groupName/usernames。
  - `PresetRequestDTO`：groupName/srcWeekStart/tgtWeekStart/mode，mode enum 为 `SKIP` 或 `OVERWRITE`。
  - `PresetResultDTO`：created/skipped/overwritten/conflicts。

KPI `ca.openbox.shift.application` 与 `ca.openbox.shift.service.KPI`

- Controller：`KPIController`、`KPIRecordController`
- Application：`KPIApplication`
- Service：`KPICalculator`、`TVWorkRateService`、`TVBonusRateService`、`KPIRecordService`、`SprintService`
- Repository：`KPIRecordRepository`、`ApplicationVariablesRepository`
- 功能：日 KPI、双周 KPI、员工/团队 KPI、target rate、bonus rate、KPI record 查询和更新、定时刷新。
- 核心数据：
  - `KPIRecordDO` -> `opb_kpi_records`
  - `ApplicationVariable` -> `opb_application_variables`
  - 应用变量：`SprintBiweekStartDate`、`TVWorkRate`、`TVBonusRate`、`PROBATION_MONTHS`。

请假申请 `ca.openbox.process`

- Controller：`LeaveApplicationController`
- Service：`LeaveApplicationService`、`EmailService`
- Queue/Consumer：`ApplicationStatusChangeMessageQueue`、`EmailNotificationConsumer`
- Repository：`LeaveApplicationRepository`
- 功能：提交请假、经理批准/拒绝、删除、添加 note、按 handler/applicant 查询、发送邮件通知。
- 核心数据：
  - `LeaveApplicationDO` -> `opb_leave_application`
  - `PutLeaveApplicationDTO`：applicant/start/end/leaveType/reason。

离职与雇佣 `ca.openbox.resignation`、`ca.openbox.employment`

- Controller：`ResignationApplicationController`、`EmploymentController`
- Service：`ResignationApplicationService`、`EmploymentService`
- Queue/Consumer：`ResignationMessageQueue`、`ResignationEmailConsumer`
- Repository：`ResignationApplicationRepository`、`EmploymentRepository`
- 功能：提交离职申请、防止重复 active 离职申请、经理 review、离职邮件通知、终止雇佣、生成雇佣记录、停用用户。
- 核心数据：
  - `ResignationApplication` -> `opb_resignations`
  - `Employment` -> `opb_employment_record`
  - `PostResignationApplicationDTO`：applicant/reason/lastWorkingDate/submittedAt。
  - `TerminateDTO`：lastDay/terminationReason。

公告 `ca.openbox.forum`

- Controller：`AnnouncementController`
- Service：`AnnouncementService`、`AnnouncementReadLogService`
- Repository：`AnnouncementRepository`、`AnnouncementReadLogRepository`
- 功能：发布、查询、详情、修改、删除公告，按用户组过滤，记录阅读状态。
- 核心数据：
  - `AnnouncementDO` -> `opb_announcement`
  - `AnnouncementReadLogDO` -> `opb_announcement_readlog`

规章 `ca.openbox.regulation`

- Controller：`RegulationController`
- Service：`RegulationService`
- Repository：`RegulationRepository`
- 功能：读取和更新规章 title/content/modifiedTime。
- 核心数据：`RegulationDO` -> `opb_regulation`

统计 `ca.openbox.statistics`

- Presentor：`WorkTimeStatisticsPresentor`
- Service：`WorkTimeStatisticService`、`WorkLoadCalculator`
- 功能：按日期范围聚合员工排班工时，包含午休扣减逻辑。
- 核心读模型：`WorkTimeStatistic` username/userRealName/hours/minutes。

基础设施 `ca.openbox.infrastructure`

- `WebhookEmailService`：通过 HTTP webhook 发邮件。
- `EmailService`：OAuth2 token 相关和旧邮件实现。
- `JwtUtil`：生成/验证 JWT。
- `Cryptor`：AES/CBC/PKCS5Padding 加密，当前用于 SIN。
- `ApplicationVariableService`：读取配置变量。
- `SecurityConfiguration`：Spring Security、CORS、PasswordEncoder、AuthenticationManager。

### 2.4 认证授权方式

- 登录 endpoint：`POST /api/user/login`。
- 登录通过 `AuthenticationManager` + `DaoAuthenticationProvider` + `UserService.loadUserByUsername()`。
- 密码编码：`DelegatingPasswordEncoder`，bcrypt。
- 登录成功返回 `UserDTO`，包含 `JSessionID` 和 JWT `token`。
- `LoginDTO.username` 支持 username 或 email；JWT subject 仍是 canonical username。
- 当前 `SecurityConfiguration` 对大多数 GET/POST/PUT/DELETE endpoint 使用 `permitAll()`，README 也明确指出 JWT 已生成但没有请求过滤器强制校验。
- 前端权限主要依赖 localStorage 中的 `user.roles` 做入口隐藏和页面判断，不是强后端授权。

## 3. 当前系统已支持的主要业务功能

1. 用户注册与登录
   - 邮箱验证码注册。
   - 用户名或邮箱登录。
   - 密码重置、密码验证。
   - 个人资料修改。
   - SIN 加密保存和读取。
   - 员工 probation 判断。

2. 排班
   - 员工查看自己的可见班次。
   - 经理/组长批量创建某天某组员工班次。
   - 修改、删除当前班次。
   - 查询某用户或某范围班次。
   - 员工选择偏好工作日期。
   - 管理当前偏好工作月份。
   - 查询法定假日。
   - 复制一周排班到目标周。

3. KPI
   - 查看团队日 KPI 和双周 KPI。
   - 查看员工日 KPI、双周 KPI、双周 bonus。
   - 管理 target rate 和 bonus rate。
   - 查看/编辑年度 KPI record。
   - 定时刷新双周 KPI record。

4. 请假流程
   - 员工提交请假申请。
   - 员工查看自己的申请。
   - 经理查看、批准、拒绝、删除申请。
   - 添加 note。
   - 邮件通知 handler。

5. 离职流程
   - 员工提交离职申请。
   - 防止重复 pending 离职申请。
   - 经理查看并标记 reviewed。
   - 终止雇佣时写入 employment record 并停用用户。
   - 生成离职模板。
   - 离职通知邮件队列。

6. 公告与规章
   - 经理发布公告。
   - 用户按组查看公告。
   - 未读公告提醒。
   - 标记公告已读。
   - 编辑/删除公告。
   - 查看和更新规章内容。

7. 团队与统计
   - 经理查看员工基础列表。
   - 终止员工雇佣。
   - 查询员工雇佣记录。
   - 按日期范围统计员工工时。

## 4. 前后端接口关系概览

### 4.1 用户与认证

- 前端来源：
  - `request/UserRequest.ts`
  - `service/UserService.ts`
  - `model/User.ts`
  - `model/RegisterInfo.ts`
- 后端来源：
  - `UserController`
  - `UserPresentor`
  - `UserService`
  - `UserDO`、`LoginDTO`、`RegisterDTO`、`UserDTO`
- 关键 API：
  - `POST /api/user/login`：body `{ username, password }`，返回 `UserDTO`。
  - `POST /api/user/send_code?email=...`
  - `POST /api/user/register?code=...`：body `RegisterDTO`。
  - `GET /api/user/check_validation?username=...`
  - `POST /api/user/verify_password`：body `{ username, password }`。
  - `POST /api/user/{username}/password`：text/plain password。
  - `GET /api/user/{username}/probation`
  - `GET /api/presentor/user/getUserByRoleName?role=...`
  - `GET /api/presentor/user/getUserByGroupName?group=...`
  - `GET /api/presentor/user/employees/basic`

### 4.2 排班、偏好班期、法定假日

- 前端来源：
  - `request/ShiftRequest.ts`
  - `request/ShiftBoardRequest.ts`
  - `request/StatutoryHolidayRequest.ts`
  - `model/Shift.ts`
  - `model/Schedule.ts`
  - `model/PreferWorkdays.ts`
  - `model/CopyStatus.ts`
- 后端来源：
  - `ShiftArrangementController`
  - `ShiftBoardController`
  - `ShiftPresentor`
  - `StatutoryHolidayController`
  - `ShiftPresetController`
  - `ShiftArrangementDTO`、`BatchCreateShiftByDateDTO`、`EmployeePreferWorkdaysDTO`、`PresetRequestDTO`
- 关键 API：
  - `GET /api/presentor/shift/{username}/findVisibleShifts?start=...&end=...`
  - `GET /api/presentor/shift/{username}/getMyShiftByStartDateScope?start=...&end=...`
  - `PUT /api/shift/shiftarrangement/batchCreateByDate`
  - `PUT /api/shift/shiftarrangement/deleteCurrentShift`
  - `PUT /api/shift/shiftarrangement/modifyCurrentShift`
  - `GET /api/shift/shiftboard/getBoardByDate?date=...`
  - `GET /api/shift/shiftboard/getBoardByUser?username=...`
  - `PUT /api/shift/shiftboard/updateBoard`
  - `PUT /api/shift/shiftboard/shiftToNextMonth`
  - `GET /api/shift/shiftboard/getCurrentMonth`
  - `GET /api/shift/statutory-holidays`
  - `POST /api/shift/preset`

注意：复制排班当前后端 DTO 使用 `srcWeekStart` / `tgtWeekStart` / `mode: SKIP|OVERWRITE`，前端也发送 `srcWeekStart` / `tgtWeekStart` / `mode: 'SKIP'`。但后端文档 `presetSchedule.md` 中旧说明写的是 `sourceWeekStart` / `targetWeekStart` 和 `SKIP_CONFLICTS|OVERWRITE_CONFLICTS`，后续微调前需要以代码还是文档为准进行确认。

### 4.3 KPI 与统计

- 前端来源：
  - `request/ShiftRequest.ts`
  - `request/RateRequest.ts`
  - `request/KPIRecordRequest.ts`
  - `request/StatisticRequest.ts`
  - `model/KPI.ts`
  - `model/KPIRecord.ts`
  - `model/WorkTimeStatistic.ts`
- 后端来源：
  - `KPIController`
  - `KPIRecordController`
  - `KPIApplication`
  - `KPIRecordService`
  - `WorkTimeStatisticsPresentor`
- 关键 API：
  - `GET /api/shift/kpi/groupName?groupName=...&date=...`
  - `GET /api/shift/kpi/user?username=...&groupName=...&date=...`
  - `GET /api/shift/kpi/groupName/biweek?groupName=...`
  - `GET /api/shift/kpi/user/biweek?username=...&groupName=...`
  - `GET /api/shift/kpi/target-rate`
  - `PUT /api/shift/kpi/target-rate`：body `{ targetRate }`
  - `GET /api/shift/kpi/bonus-rate`
  - `PUT /api/shift/kpi/bonus-rate`：body `{ bonusRate }`
  - `GET /api/shift/kpi-record?year=...`
  - `POST /api/shift/kpi-record`
  - `PUT /api/shift/kpi-record/{id}`
  - `GET /api/presentor/statistic/work-time-statistic?start=...&end=...`

### 4.4 请假、离职、雇佣

- 前端来源：
  - `request/LeaveApplicationRequest.ts`
  - `request/ResignationApplicationRequest.ts`
  - `request/EmploymentRequest.ts`
  - `model/LeaveApplication.ts`
  - `model/ResignationApplication.ts`
  - `model/Employment.ts`
  - `model/TerminateInfo.ts`
- 后端来源：
  - `LeaveApplicationController`
  - `ResignationApplicationController`
  - `EmploymentController`
  - `LeaveApplicationDO`、`PutLeaveApplicationDTO`
  - `ResignationApplication`、`PostResignationApplicationDTO`
  - `Employment`、`TerminateDTO`
- 关键 API：
  - `PUT /api/process/application/leave-application`
  - `GET /api/process/application?handler=...&applicant=...`
  - `POST /api/process/application/{id}/permit`
  - `POST /api/process/application/{id}/reject`：text/plain reason。
  - `PUT /api/process/application/{id}/note`：text/plain note。
  - `DELETE /api/process/application/{id}`
  - `POST /api/resignations`
  - `GET /api/resignations`
  - `GET /api/resignations/{applicant}`
  - `PUT /api/resignations/{id}`
  - `POST /api/employment/{username}/terminate`
  - `GET /api/employment/{username}/employment`

### 4.5 公告与规章

- 前端来源：
  - `request/AnnouncementRequest.ts`
  - `request/RegulationRequest.ts`
  - `model/Announcement.ts`
  - `model/AnnouncementReadLog.ts`
  - `model/Regulation.ts`
- 后端来源：
  - `AnnouncementController`
  - `RegulationController`
  - `AnnouncementDO`、`AnnouncementReadLogDO`
  - `PostAnnouncementDTO`、`PutAnnouncementDTO`、`PostAnnouncementReadLogDTO`
  - `RegulationDO`、`PutRegulationDTO`
- 关键 API：
  - `POST /api/announcement`
  - `GET /api/announcement?expireAfter=...&username=...`
  - `GET /api/announcement/{announcementId}`
  - `PUT /api/announcement/{announcementId}`
  - `DELETE /api/announcement/{announcementId}`
  - `GET /api/announcement/readLog?reader=...`
  - `POST /api/announcement/{announcementId}/read`
  - `GET /api/regulation/{regulationId}`
  - `PUT /api/regulation/{regulationId}`

## 5. 后续系统微调前需要向用户确认的问题

1. 微调目标
   - 这次微调优先解决 UI/交互、业务规则、权限安全、接口稳定性，还是数据一致性？
   - 是否有明确的页面、流程、用户角色和验收标准？

2. 用户角色与权限
   - 角色字符串是否统一为 `Manager`、`team_leader`、`tester` 等现有值？
   - 一个用户是否可能有多角色，例如 `Manager|team_leader`？
   - 是否需要后端强制鉴权，而不是只依赖前端隐藏入口？

3. 组织与组别
   - 当前多处写死 `surrey`、`public`、`manager/tester`，是否要支持更多门店/组别？
   - 员工注册后默认角色为 `tester`，默认 groupName 似乎未在注册时设置，后续是否要让 HR 分配？

4. 登录与账号
   - 是否继续保持 `LoginDTO.username` 字段兼容 username/email，还是新增更清晰的 `identifier`？
   - JWT 当前返回但未被前端统一附带、后端未强制校验，是否需要纳入微调范围？
   - 密码重置是否允许任何已知 username 被直接重置，还是需要权限/验证码？

5. 移动端适配
   - 需要优先支持 Web 端、手机浏览器，还是原生 iOS/Android？
   - 当前部分页面使用表格和宽卡片，例如 Team、KPI chart、排班表，手机端是否允许横向滚动，还是要改为卡片列表？

6. 排班
   - team_leader 的编辑窗口规则是否仍为“下月前 7 天到下月 1 日前”？
   - 复制排班的冲突处理是否只允许目标周为空，还是需要真正支持 skip/overwrite？
   - 排班时间和统计是否全部以 America/Vancouver 为准？

7. 请假与离职
   - 请假类型、审批人、状态值是否需要标准化？
   - 离职状态是否只保留 `PENDING_REVIEW` 和 `REVIEWED`？
   - 离职后是否自动停用账号、清理未来班次、同步 employment record？

8. 邮件通知
   - 邮件发送使用 WebhookEmailService 还是 EmailService 的 OAuth/SMTP 实现？
   - 发送失败是否需要重试、记录失败日志或人工补发？
   - HR/经理收件人来源是固定配置、角色查询，还是数据库变量？

9. 数据模型
   - 是否允许改表、改字段、改约束或补充索引？
   - 是否需要保留历史数据兼容？
   - 是否存在生产数据库的完整 schema 和迁移流程？

10. 测试与验收
   - 是否要求补充后端单元/集成测试？
   - 是否要求前端关键流程测试？
   - 是否有测试账号和测试数据库可用？

## 6. 风险与注意事项

### 6.1 数据库风险

当前阶段没有执行数据库操作，也没有生成必须立即执行的 SQL。

后续微调如果涉及以下内容，必须先由用户确认，并在 issue 中提供完整 SQL，由用户执行；我们不能直接操作数据库：

- 新增表，例如独立审批记录、通知记录、审计日志。
- 新增字段，例如 user profile、employment record、leave/resignation 扩展字段。
- 修改字段类型，例如时间字段、状态字段、role/group 字段。
- 增加唯一约束，例如防止同员工同日重复排班、限制 pending 离职申请。
- 数据迁移，例如角色值大小写统一、历史 groupName 补齐、状态值标准化。
- 加索引，例如按 username/date/status/groupName 高频查询。

潜在数据库关注点：

- `opb_user.roles` 当前是字符串，前端有 `|` 分隔多角色的假设，但部分代码严格比较单角色。
- `opb_user.groupName` 对排班、公告、KPI 有关键影响，注册流程默认未显式设置。
- `opb_shift_arrangement` 目前复制排班通过服务层检查目标周是否为空，没有数据库层唯一约束防止重复班次。
- `opb_resignations` 防重复依赖服务逻辑，若要强一致可能需要状态约束或索引策略。
- 邮件队列是内存队列，进程重启会丢失未发送消息；如要可靠通知，可能需要表结构支持。
- `src/main/resources/ddl` 只有部分 schema，不能作为完整迁移依据。

### 6.2 安全与权限风险

- 后端大多数 endpoint 是 `permitAll()`，JWT 没有请求过滤器强制校验。
- 前端 localStorage 中的 `user.roles` 决定入口显示，容易被篡改。
- 密码重置 endpoint 当前没有明显的后端权限保护。
- 固定 CSRF token header 与后端 `csrf.disable()` 并存，语义不清。
- CORS 配置允许 `addAllowedOriginPattern("*")` 且 `allowCredentials=true`，后续生产化需要确认来源白名单。

### 6.3 前后端契约风险

- DTO 命名不完全一致：
  - 前端 `User.legalName`，后端 `legalname` / `legalName` 混用。
  - 前端 `ResignationApplication.reviewBy`，后端字段为 `reviewedBy`。
  - 复制排班文档与代码字段/枚举不一致。
- 时间类型混用：
  - 前端使用 Date、Dayjs、Moment。
  - 后端使用 LocalDate、ZonedDateTime。
  - 多处依赖 Vancouver 时区，微调时要避免跨日错误。
- role 判断不统一，可能导致手机端/页面入口和后端实际能力不一致。

### 6.4 前端维护风险

- 多处页面直接读写 localStorage，认证状态不集中。
- 部分 `useEffect` 缺少依赖数组，可能重复渲染或重复请求。
- 页面布局以 Web/桌面表格为主，手机端需要单独验证：
  - Team DataTable
  - KPI Recharts
  - ScheduleTable
  - 排班操作页
- UI 库混用 Gluestack、React Native Paper、Ant Design、MUI，风格和移动端行为可能不一致。

### 6.5 后端维护风险

- 邮件通知使用内存队列，不持久。
- 缺少测试源码，后续微调的回归风险较高。
- `application.yml` 是模板，实际配置在 `/etc/openbox/config.yml`，本地运行需确认配置。
- 生产 schema 需从数据库或完整迁移脚本确认，不能仅依赖 JPA entity。

## 7. 建议的后续工作顺序

1. 与用户确认本次“系统微调”的业务目标和验收标准。
2. 明确是否允许改数据库；若允许，先做 SQL 方案并由用户执行。
3. 先统一前后端接口契约和角色/权限规则。
4. 对手机端优先页面做响应式方案，尤其是排班、Team、KPI、申请列表。
5. 对高风险改动补测试或至少补关键手工验收清单。
6. 再进入具体需求拆解和实现。
