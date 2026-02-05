# components（模块 2）经营性用房（Commercial）

本模块覆盖 `components/Commercial*.tsx`、`components/CommercialManagement*.tsx`。

整体结构上，当前商业域的路由页大多是 **wrapper**，实际业务与数据模型主要集中在：

- `CommercialHousing.tsx`（超级聚合页：商业 + 公寓两个子域）
- `CommercialHousingOverview.tsx`（按“房间维度”的商业总览台账 + 可派生/可手工编辑 + 与 CommercialHousing 的“新增联动”）

在 `App.tsx` 中的核心路由：

- `commercial-home` -> `/hall/commercial-mgmt/home`
- `commercial-overview` -> `/hall/commercial-mgmt/overview`
- `commercial-spaces` -> `/hall/commercial-mgmt/spaces`
- `commercial-contracts` -> `/hall/commercial-mgmt/contracts`
- `commercial-rent` -> `/hall/commercial-mgmt/rent`
- `commercial-analytics` -> `/hall/commercial-mgmt/analytics`

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## CommercialManagementHome.tsx

- **用途**：经营性用房管理模块主页（入口导航）。
- **路由入口**：`commercial-home`（`/hall/commercial-mgmt/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: View) => void; userRole: UserRole }`
  - 默认导出 `CommercialManagementHome`
  - 当前实现仅使用 `onNavigate`，未使用 `userRole`。
- **关键状态 / 数据流**：
  - `modules` 数组定义 4 个入口卡片：
    - `commercial-overview` / `commercial-spaces` / `commercial-contracts` / `commercial-rent`
  - 点击卡片调用 `onNavigate(mod.id)`，由 `App.tsx` 切换 `currentView` 完成页面切换。
- **关键依赖**：`View`（来自 `App.tsx` 类型导出）、`lucide-react`。
- **扩展点**：
  - 按 `userRole` 控制入口可见性（例如游客只看 overview）。
  - 将模块列表配置化（服务端/metadata.json）。

## CommercialManagementOverview.tsx

- **用途**：经营性用房“经营概览”路由页包装器。
- **路由入口**：`commercial-overview`（`/hall/commercial-mgmt/overview`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `CommercialManagementOverview`
- **关键状态 / 数据流**：无（纯包装）。
- **关键依赖**：`CommercialHousing`。
- **扩展点**：如果后续拆分商业模块为独立页面组件，这里可直接替换为新实现。

## CommercialManagementSpaces.tsx / CommercialManagementContracts.tsx / CommercialManagementRent.tsx / CommercialManagementAnalytics.tsx

- **用途**：分别对应“房源管理 / 合同管理 / 租金管理 / 数据分析”的路由页包装器。
- **路由入口**：
  - `commercial-spaces`（`/hall/commercial-mgmt/spaces`）
  - `commercial-contracts`（`/hall/commercial-mgmt/contracts`）
  - `commercial-rent`（`/hall/commercial-mgmt/rent`）
  - `commercial-analytics`（`/hall/commercial-mgmt/analytics`）
- **主要 Props / 导出**：均为 `({ userRole }: { userRole: UserRole })` 默认导出。
- **关键状态 / 数据流**：无（纯包装）。
- **关键依赖**：均复用 `CommercialHousing`，通过 `initialCommercialTab` 控制默认子 Tab。
- **扩展点**：
  - 如果需要更细粒度权限控制（例如合同/租金仅资产管理员可见），可在这些 wrapper 层做拦截。

---

## CommercialHousing.tsx（模块核心聚合页，部分已读）

- **用途**：商业与公寓双域的“超级页面”（tabs + 大量 CRUD + 弹窗），提供：
  - 经营性用房：总览、房源、合同、租金、分析
  - 公寓/周转房：总览、申请、房间、水电、押金

- **路由入口**：
  - 游客登录（`UserRole.Guest`）时，`App.tsx` 会直接渲染 `<CommercialHousing userRole={userRole} />`。
  - 资产/教师通过 `CommercialManagement*` wrapper 进入时，会传入 `initialCommercialTab` 固定定位到某个子 tab。

- **主要 Props / 导出**：
  - 默认导出 `CommercialHousing`
  - Props：
    - `userRole: UserRole`
    - `initialMainTab?: 'commercial' | 'apartment'`
    - `initialCommercialTab?: 'overview' | 'spaces' | 'contracts' | 'rent' | 'analytics'`
    - `initialApartmentTab?: 'overview' | 'applications' | 'rooms' | 'utilities' | 'deposits'`
    - `hideMainTabNav?: boolean`
    - `hideSubTabNav?: boolean`
    - `pageTitle? / pageSubtitle?`

- **关键状态 / 数据流（已读到的核心点）**：
  - 数据均为本地持久化：`useLocalStorage`（hooks 版），初始值为大量 mock。
    - `commercial-spaces-v2`、`commercial-contracts-v2`、`rent-bills-v2`
    - `apartment-apps-v2`、`apartment-rooms-v2`、`utility-readings-v2`、`utility-bills-v2`、`deposits-v2`
  - 竞标 -> 合同联动：`handleConfirmBidWinner(bid)` 更新 bids Winner/Loser，并预填合同，打开 `ContractUpsertModal`。
  - 统计聚合：`commercialStats` / `apartmentStats`。
  - 房源“重复键”辅助：`isDuplicateSpaceKey` 通过解析中文 `SpaceItem.name`（楼层+房号）判断重复。

- **关键依赖**：
  - `lucide-react`、`recharts`
  - `CommercialHousingOverview`（并导出 `CreateFromOverviewPayload`）
  - `ContractModals`（`ContractUpsertModal/DeleteConfirmationModal`）
  - `BidModals`（`BidListModal` + `BidItem`）

- **扩展点**：
  - 建议拆分为 commercial 与 apartment 两个子域目录，减少单文件体积与耦合。
  - 将状态机（竞标->合同->账单）后端化。
  - 结构化字段替代 `parseSpaceKeyFromName` 的中文字符串解析。

---

## CommercialHousingOverview.tsx

- **用途**：经营性用房“按房间维度”的总览台账页面（可从 `spaces/contracts/rentBills` 派生基础台账，并允许用户手工维护字段；支持在总览里新增“已出租台账”时触发创建合同/账单的联动）。
- **路由入口**：
  - 主要由 `CommercialHousing.tsx` 在 `commercialTab === 'overview'` 时引用。
  - 也可能被其它 overview 页面复用。

- **主要 Props / 导出**：
  - 默认导出 `CommercialHousingOverview`
  - 导出类型：
    - `CreateFromOverviewPayload`：用于把“总览台账新增的一条已出租记录”转换为可创建合同/账单的 payload。
  - Props：
    - `spaces: CommercialSpaceItem[]`
    - `contracts: CommercialContractItem[]`
    - `rentBills: CommercialRentBill[]`
    - `onCreateFromOverview?: (payload: CreateFromOverviewPayload) => void`

- **关键状态 / 数据流**：
  - **派生数据**：`derivedRows`（useMemo）
    - 建立索引：
      - `contractBySpaceId`（spaceId -> contract）
      - `billsByContractId`（contractId -> bills[]）
    - 逐 `spaces` 生成一行 `CommercialOverviewRow`：
      - 若 `s.status === '已出租'` 且存在 contract，则 `rented=true`。
      - “核定经营项目/实际经营项目/业态分类/租金标准”等字段通过 infer 函数从名称和租户推断：
        - `inferApprovedBusiness(spaceName)`
        - `inferActualBusiness(tenant, spaceName)`
        - `inferBusinessCategory(actualBusiness)`
        - `inferTenantType(tenant)`
        - `inferPhone(tenantContact)`
      - 合规状态：
        - `hasArrearsBill`（存在 Unpaid/Overdue bill）
        - `computeComplianceStatus(contract, approved, actual, hasArrearsBill)`：优先判定欠费/到期，其次判定超范围经营，否则完全合规。
      - 月均收入：`calcAvgMonthlyIncomeFromBills(contract.id, rentBills)`，若无则 fallback 到 `rentPerMonth`。
  - **持久化策略（Cookie）**：
    - 使用 `document.cookie` 存 `commercial_overview_rows_v1`。
    - 初始化 `rows`：若 cookie 有值则优先用 cookie（保留用户手工编辑），否则用 `derivedRows`。
    - `useEffect(rows)`：每次 rows 变化都会 `saveRowsToCookie(rows)`。
  - **与派生结果的同步规则**：
    - 当 `derivedRows` 变化时：只“补充新增的房源行”（按 `roomId` 去重），**不覆盖已存在行**，避免覆盖用户手工编辑。
  - **二次计算 computedRows**：
    - 基于 `rows` 重新计算：
      - `complianceStatus`（结合 contract + bills）
      - `avgMonthlyIncome`（按 `contractNo` 反查 contract，再按 bills 计算）
  - **新增/编辑弹窗**：`RowUpsertModal`
    - 新增时自动生成合同号：`genContractNo()`（避免与 rows/contracts 重复）。
    - 维护 leaseStart/leaseEnd，并拼成 `leaseRange`。
    - `avgMonthlyIncome` 由 `contractNo` 推导。
    - 保存按钮要求 `roomId/building/roomNo` 必填。
  - **新增联动（关键业务桥）**：
    - `handleUpsert(next)`：
      - 若是新增（`!editingRowId`）且 `onCreateFromOverview` 存在且 `next.status==='已出租'`：
        - 从 `leaseRange` 拆 `startDate/endDate`
        - `monthlyRent` 必须为 number 且 >0
        - 触发 `onCreateFromOverview(payload)`
      - 该 payload 会在 `CommercialHousing.tsx` 中被消费，用于创建合同/账单并联动其它 tab。
  - **占用统计**：
    - `occupiedCount = max(spaces已出租数, contracts.length)`
    - `vacantCount = max(0, total(固定=10) - occupiedCount)`
    - UI 用 `CommercialOverviewOccupancyDonut total={10} ...` 展示。

- **关键依赖**：
  - `CommercialOverviewOccupancyDonut`（入住率 donut）
  - React hooks（useMemo/useEffect/useState）
  - 浏览器 Cookie API（`document.cookie`）

- **扩展点**：
  - Cookie 存储有长度限制且不可结构化查询；建议改为 localStorage 或后端存储，并增加版本迁移。
  - `total=10` 是硬编码：应由后端或资产台账提供总房源数。
  - “推断逻辑”应替换为后端字段（核定经营/实际经营/业态）。
  - `roomNo` 当前在 UI 中既表示房间号又可能填入 `s.name`（含“几层几号商铺”），建议拆字段。

---

## CommercialOverviewOccupancyDonut.tsx

- **用途**：经营性用房总览的占用/空闲环形图组件。
- **路由入口**：非路由组件，由 `CommercialHousingOverview.tsx` 引用。
- **主要 Props / 导出**：
  - Props：`{ total: number; occupied: number; vacant: number }`
  - 默认导出 `CommercialOverviewOccupancyDonut`
- **关键状态 / 数据流**：无内部状态；将 `occupied/vacant` 映射到 `recharts` 的 `PieChart/Pie/Cell`。
- **关键依赖**：`recharts`。
- **扩展点**：
  - 增加百分比显示、tooltip、点击回调（例如点击“空闲”筛选台账）。

---

## CommercialHousingEnhanced.tsx

- **用途**：经营性用房的“增强版”单页实现（与 `CommercialHousing.tsx` 作用重叠），采用另一套数据模型与 constants（`MOCK_CONTRACTS_EXTENDED` 等），并内置了一个简化版 `useLocalStorage` hook。

- **路由入口**：目前 `App.tsx` 没有直接路由到该组件（从 `App.tsx` 导入列表看，它存在但不一定被使用）。

- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `CommercialHousingEnhanced`

- **关键状态 / 数据流**（根据文件开头已读部分）：
  - Tabs：
    - `mainTab: 'commercial' | 'apartment'`
    - `commercialTab: 'contracts' | 'rent' | 'bidding' | 'tenants' | 'analytics'`
    - `apartmentTab: 'applications' | 'rooms' | 'utilities' | 'deposits' | 'checkin'`
  - 数据源：使用本文件内的 `useLocalStorage`（直接操作 `window.localStorage`），key 与 `CommercialHousing.tsx` 不同：
    - `contracts-extended`
    - `rent-bills`
    - `bidding-projects`
    - `tenant-profiles`
    - 以及更多（需要继续向下读取才能完整列出与说明）
  - Mock 常量来自 `constants.ts`：
    - `MOCK_RENT_BILLS`、`MOCK_CONTRACTS_EXTENDED`、`MOCK_BIDDING_PROJECTS`、`MOCK_TENANT_PROFILES`...

- **关键依赖**：
  - `types.ts` 中扩展类型（`ContractExtended/BiddingProject/TenantProfile/...`）
  - `constants.ts` 中对应 MOCK 集合
  - `lucide-react`

- **扩展点**：
  - 当前项目同时存在 `CommercialHousing.tsx` 与 `CommercialHousingEnhanced.tsx` 两套实现，建议选定一个作为主线：
    - 若保留 Enhanced：可逐步将其拆分成多个页面并接入路由。
    - 若弃用 Enhanced：应在文档中标记为“历史/备用实现”，并避免重复维护。
  - 建议统一 `useLocalStorage` hook（当前项目已有 `../hooks/useLocalStorage`）。

