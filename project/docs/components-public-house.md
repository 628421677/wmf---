# components（模块 7）公房综合查询（PublicHouse）

本模块对应 `App.tsx` 中业务大厅 -> **公房综合查询**：

- `public-house-home` -> `/hall/public-house-query/home`
- `public-house-one-person-multi-room` -> `/hall/public-house-query/one-person-multi-room`
- `public-house-one-room-multi-person` -> `/hall/public-house-query/one-room-multi-person`
- `public-house-dept-overview` -> `/hall/public-house-query/dept-overview`
- `public-house-quota` -> `/hall/public-house-query/quota`
- `public-house-room-usage` -> `/hall/public-house-query/room-usage`
- `public-house-commercial` -> `/hall/public-house-query/commercial`

> 结构特点：
>
>- `PublicHouseQueryHome.tsx` 是模块入口导航页。
>- `*Query.tsx` / `*QueryPage.tsx` 都是 **wrapper**，统一复用 `PublicHouseComprehensiveQuery.tsx` 这个“超级页面”，并通过 `initialTab` 指定默认 tab。
>- `PublicHouseComprehensiveQuery.tsx` 是一个 tab 容器，根据 `activeTab` 渲染对应的“查询实现组件”。
>- 各查询实现组件（`PublicHouseOnePersonMultiRoom.tsx` / `PublicHouseOneRoomMultiPerson.tsx` / `PublicHouseDeptOverview.tsx` / `PublicHouseQuotaManagement.tsx` / `PublicHouseRoomUsageQuery.tsx` / `PublicHouseCommercialQuery.tsx`）是最终的业务 UI。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## PublicHouseQueryHome.tsx

- **用途**：公房综合查询模块主页（入口导航）。
- **路由入口**：`public-house-home`（`/hall/public-house-query/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: View) => void }`
  - 默认导出 `PublicHouseQueryHome`
- **关键状态 / 数据流**：
  - `modules` 定义 6 个入口卡片，对应 6 个子查询功能。
  - 点击卡片通过 `onNavigate(mod.id)` 切换 `currentView`。
- **关键依赖**：`View`（App 路由类型）、`lucide-react`。
- **扩展点**：入口按角色/权限配置化。

## *Query.tsx / *QueryPage.tsx（系列 wrapper）

- **用途**：路由 wrapper，将不同路由映射到 `PublicHouseComprehensiveQuery.tsx` 的不同 tab。
- **路由入口**：
  - `public-house-one-person-multi-room` -> `PublicHouseOnePersonMultiRoomQuery`
  - `public-house-one-room-multi-person` -> `PublicHouseOneRoomMultiPersonQuery`
  - `public-house-dept-overview` -> `PublicHouseDeptOverviewQuery`
  - `public-house-quota` -> `PublicHouseQuotaQuery`
  - `public-house-room-usage` -> `PublicHouseRoomUsageQueryPage`
  - `public-house-commercial` -> `PublicHouseCommercialQueryPage`
- **主要 Props / 导出**：均为无 props 默认导出。
- **关键状态 / 数据流**：无（纯 wrapper）。
- **关键依赖**：`PublicHouseComprehensiveQuery`。
- **扩展点**：可在 wrapper 层做权限拦截。

---

## PublicHouseComprehensiveQuery.tsx（核心聚合页）

- **用途**：公房综合查询“超级页面”，提供 6 个 tab 并渲染对应查询组件。
- **主要 Props / 导出**：
  - Props：
    - `initialTab?: 'onePersonMultiRoom' | 'oneRoomMultiPerson' | 'deptOverview' | 'quotaQuery' | 'roomUsageQuery' | 'commercialQuery'`（默认 `onePersonMultiRoom`）
    - `hideTabNav?: boolean`（默认 false，但 wrapper 里都设为 true）
    - `pageTitle? / pageSubtitle?`
  - 默认导出 `PublicHouseComprehensiveQuery`
- **关键状态 / 数据流**：
  - `activeTab`：控制当前 tab。
  - `keyword`：搜索框输入，会透传给子组件。
  - 根据 `activeTab` 渲染不同子组件，并将 `keyword` 传入。
- **关键依赖**：
  - `PublicHouseOnePersonMultiRoom`
  - `PublicHouseOneRoomMultiPerson`
  - `PublicHouseDeptOverview`
  - `PublicHouseQuotaManagement`
  - `PublicHouseRoomUsageQuery`
  - `PublicHouseCommercialQuery`
  - `MOCK_DEPARTMENT_QUOTAS`（`constants`，用于 `quotaQuery` tab）
- **扩展点**：
  - 可增加全局筛选条件（如校区、楼栋）并透传给子组件。

---

## 各查询实现组件

### PublicHouseOnePersonMultiRoom.tsx

- **用途**：一人多房查询（按老师维度）。
- **关键状态 / 数据流**：
  - `rows` 初始为 `buildInitialRows()`（mock 数据）。
  - `filteredRows`：按 `keyword` 筛选 `staffNo/teacherName/deptName`。
  - 定额面积：`deriveQuotaAreaFromRuleEngine(title)` 从 `MOCK_QUOTA_CONFIGS` 读取人员系数（教授/副教授/中级及以下）计算。
  - 合规状态：`computeComplianceStatus(violationTypes)` 根据违规类型（无/部分/完全）计算。
  - 新增/编辑弹窗：
    - `editingId` 区分新增/编辑。
    - `save()`：自动计算定额/合规，并更新 `rows`。
- **扩展点**：
  - 教师列表与用房关系应改为后端接口。
  - `deriveQuotaAreaFromRuleEngine` 应接入真实规则引擎。

### PublicHouseOneRoomMultiPerson.tsx

- **用途**：一房多人查询（按房间维度）。
- **关键状态 / 数据流**：
  - `rows` 初始为 `buildOneRoomMockRows()`。
  - `filteredRows`：按 `keyword` 筛选 `seqNo/roomCode/location`。
  - 合规状态：`computeOpmComplianceStatuses(...)` 根据“核定人数 vs 实际人数”、“是否备案”、“是否跨部门”等计算。
  - 新增/编辑弹窗：
    - `OccupantEditor` 子组件管理占用主体列表。
    - `ViolationSelector` 子组件管理违规类型。
    - `save()`：若 `roomCode` 已存在，则自动**合并**占用主体与违规类型，而不是报错。
- **扩展点**：
  - 房间与占用关系应改为后端接口。

### PublicHouseDeptOverview.tsx

- **用途**：部门概况查询（按学院/行政部门等单位）。
- **关键状态 / 数据流**：
  - `rows` 初始为 `mockRows`。
  - `filteredRows`：按 `keyword` 筛选 `deptCode/deptName/deptType`。
  - 核定面积：`deriveDeptQuotaAreaFromRuleEngine(deptType, staffingQuota)` 根据部门类型与编制人数做“规则占位实现”。
  - 合规状态：`computeComplianceStatus(quotaArea, actualArea)` 根据超额比例分“完全合规/部分超额/严重超额”。
  - 房源分布：`parseRoomDistribution(text)` 从“办公室 30%、实验室 40%”等文本解析。
  - 新增/编辑弹窗：自动计算核定面积与使用率。
- **扩展点**：
  - 部门定额规则应接入真实规则引擎。
  - 房源分布应从房间台账按部门统计，而不是手填。

### PublicHouseQuotaManagement.tsx

- **用途**：各单位定额使用情况查询（纯展示）。
- **主要 Props / 导出**：
  - Props：`{ quotas: DepartmentQuota[] }`
  - `PublicHouseComprehensiveQuery` 中传入的是 `MOCK_DEPARTMENT_QUOTAS`。
- **关键状态 / 数据流**：
  - 遍历 `quotas` 展示：部门、编制、学生数、学科系数、基础/调整后定额、当前/剩余用量。
  - `ProgressBar` 组件可视化使用率。
- **扩展点**：
  - `quotas` 应由后端根据规则引擎与人事/教务数据实时计算。

### PublicHouseRoomUsageQuery.tsx

- **用途**：公用房查询（按房间维度），重点关注用途与合规性。
- **关键状态 / 数据流**：
  - 数据源：`useLocalStorage<RoomUsageRow[]>(STORAGE_KEY, buildDerivedRows())`
    - `STORAGE_KEY = 'public-house-room-usage-rows-v1'`
    - `buildDerivedRows()`：从 `MOCK_AVAILABLE_ROOMS` / `MOCK_PERSON_ROOM_RELATIONS` / `MOCK_ROOM_TRANSFER_RECORDS` / `MOCK_ROOM_CHANGE_REQUESTS` **派生**出初始台账。
  - `filteredRows`：按 `keyword` 筛选。
  - 合规状态：`computeComplianceStatus(approvedPurpose, actualPurpose)` 对比核定与实际用途。
  - 闲置信息：`computeIdleInfo(availability, vacantSince)` 计算闲置天数/月数。
  - 新增/编辑弹窗：`RoomUsageFormModal`（当前版本中，该弹窗组件已存在但未被调用，属于预留 UI）。
- **扩展点**：
  - 启用并完善 `RoomUsageFormModal`，允许用户维护“实际用途”等盘点信息。
  - 将 `buildDerivedRows` 的派生逻辑改为后端多表关联查询。

### PublicHouseCommercialQuery.tsx

- **用途**：商用房查询（经营性用房）。
- **关键状态 / 数据流**：
  - `rows` 来自 `getCommercialSpacesForQuery()`（静态 mock）。
  - `filteredRows`：按 `keyword` 筛选 `id/name/status`。
- **扩展点**：
  - 数据源应对接 `CommercialHousing` 模块的 `commercial-spaces-v2` localStorage 或后端接口。

---

## 状态

- **模块 7 初版已完成**：已覆盖公房综合查询下所有子模块，并指出了 wrapper -> 聚合页 -> 实现组件的架构模式。

