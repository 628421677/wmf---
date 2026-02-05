# components/ 目录文件详细说明（UniAssets）

本文档按 `components/*.tsx` 文件逐一说明。

说明字段：

- **用途**：这个文件负责的业务/页面/组件职责
- **路由入口**：该组件在 `App.tsx` 中对应的 `View` / path（如果有）
- **主要 Props / 导出**：组件对外暴露的 props（如能从源码静态识别）
- **关键状态 / 数据流**：主要 `useState/useEffect`、数据结构、Mock 数据、与其他模块交互
- **关键依赖**：主要第三方库与本地依赖
- **扩展点**：后续接入后端/扩展功能时建议修改的位置

> 说明：当前项目多数页面含 Mock 数据与前端状态；如后续接入接口，建议集中沉淀到 `services/` 并统一错误处理与权限校验。

---

## 入口与导航相关（与 components 强相关）

- **路由中心**：`App.tsx`
  - 通过 `View` 联合类型 + `viewToPath` 映射维护路由。
  - `renderContent()` 使用 `switch(currentView)` 返回各页面组件。
  - `Login` 登录后根据 `UserRole` 设置初始 `currentView`。
  - 侧边栏菜单 `hallSubMenus` 对不同角色做可见性控制。

---

## 文件逐项说明

### AlertLogs.tsx

- **用途**：预警/告警日志列表或日志页面组件（具体以内部实现为准）。
- **路由入口**：通常被 `Dashboard` 或报表/日志相关页面引用；如在 `App.tsx` 中存在对应路由则以 `App.tsx` 为准。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：一般包含告警条目、筛选条件、分页等 UI 状态。
- **关键依赖**：可能依赖 `MOCK_ALERTS`（见 `constants.ts`）以及图标组件。
- **扩展点**：
  - 将告警数据源从 Mock 替换为 `services/alert` 拉取。
  - 增加筛选条件（类型、优先级、时间范围）与服务端分页。

### ApartmentHousingLedgerOverview.tsx

- **用途**：公寓/宿舍台账总览页面（统计、列表、筛选）。
- **路由入口**：通常作为公寓管理模块的子页面，可能由 `ApartmentManagementOverview`/`ApartmentManagementHome` 间接进入。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：
  - 台账数据源、筛选条件（楼栋/房型/状态）、表格行选择。
- **关键依赖**：可能使用图表（`recharts`）或表格/卡片 UI。
- **扩展点**：对接宿舍/公寓台账接口；支持导出（`xlsx`）。

### ApartmentHousingOverview.tsx

- **用途**：公寓/宿舍居住概览（入住率、床位、分布等）。
- **路由入口**：`App.tsx` 中公寓与宿舍管理：`apartment-overview`（`/hall/residence-mgmt/overview`）。
- **主要 Props / 导出**：默认导出 React 组件（通常接收 `userRole`）。
- **关键状态 / 数据流**：概览统计、图表数据、选中楼栋/区域。
- **关键依赖**：`recharts`、`lucide-react`。
- **扩展点**：
  - 把统计数据与列表改为从后端获取。
  - 引入统一的“组织/学院”维度筛选。

### ApartmentManagementApplications.tsx

- **用途**：入住申请管理（申请列表、审批/状态流转）。
- **路由入口**：`apartment-applications`（`/hall/residence-mgmt/applications`）。
- **主要 Props / 导出**：多为 `userRole`。
- **关键状态 / 数据流**：
  - 申请单列表、筛选、审批弹窗/抽屉状态。
- **关键依赖**：可能依赖弹窗组件（若项目内自写）。
- **扩展点**：对接申请单 API；增加审批流日志。

### ApartmentManagementDeposits.tsx

- **用途**：押金管理（收/退押金、押金台账）。
- **路由入口**：`apartment-deposits`（`/hall/residence-mgmt/deposits`）。
- **主要 Props / 导出**：多为 `userRole`。
- **关键状态 / 数据流**：
  - 押金记录列表、状态（已缴/待退/已退）、操作弹窗。
- **关键依赖**：`xlsx`（导出）可能使用。
- **扩展点**：与缴费模块打通；增加对账。

### ApartmentManagementHome.tsx

- **用途**：公寓与宿舍管理的“首页/导航页”，聚合入口卡片并引导到子模块。
- **路由入口**：`residence-home`（`/hall/residence-mgmt/home`）。
- **主要 Props / 导出**：`userRole`、`onNavigate(View)`（由 `App.tsx` 传入）。
- **关键状态 / 数据流**：通常是 UI 导航，不应承载复杂业务数据。
- **关键依赖**：`View` 路由体系（在 `App.tsx`）。
- **扩展点**：
  - 将“快捷入口”配置化（从后端/配置文件加载）。
  - 加入权限提示与无权限的禁用态。

### ApartmentManagementOverview.tsx

- **用途**：公寓管理总体概览页（统计、入住、空置等）。
- **路由入口**：`apartment-overview`（`/hall/residence-mgmt/overview`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：图表/统计卡片数据、筛选。
- **关键依赖**：`recharts`。
- **扩展点**：对接真实统计接口；增加钻取到楼栋/房间。

### ApartmentManagementRooms.tsx

- **用途**：房间管理（房间列表、床位、状态、分配入口）。
- **路由入口**：`apartment-rooms`（`/hall/residence-mgmt/rooms`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：房间选择、筛选、批量操作。
- **关键依赖**：与 `ApartmentManagementRoomsPage` / `ApartmentRoomAllocationPage` 可能配合。
- **扩展点**：
  - 将房间/床位作为可复用实体组件。
  - 支持批量导入/导出（`xlsx`）。

### ApartmentManagementRoomsPage.tsx

- **用途**：更偏“页面级”的房间管理实现（可能含分页、复杂筛选）。
- **路由入口**：视 `App.tsx` 是否直接挂载；否则由 `ApartmentManagementRooms` 引用。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：房间数据表、编辑弹窗。
- **关键依赖**：同上。
- **扩展点**：拆分为 `RoomsTable`/`RoomEditor` 等小组件以便维护。

### ApartmentManagementUtilities.tsx

- **用途**：水电管理（抄表、费用、异常）。
- **路由入口**：`apartment-utilities`（`/hall/residence-mgmt/utilities`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：水电记录、月份/楼栋筛选。
- **关键依赖**：可能复用收费管理模块的展示方式。
- **扩展点**：与收费/账单模块统一数据模型。

### ApartmentRoomAllocationPage.tsx

- **用途**：房间分配页面（宿舍分配、调宿、床位分配）。
- **路由入口**：`apartment-allocation`（`/hall/residence-mgmt/allocation`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：
  - 分配规则、候选人/床位选择、确认提交等。
- **关键依赖**：可能用到表格、拖拽或弹窗。
- **扩展点**：
  - 抽象“分配算法/规则”为独立模块（可与 `RuleEngine` 对接）。
  - 接入审批流。

### AssetDigitalization.tsx

- **用途**：资产数字化模块（房屋建筑/房间原子单元）页面。
- **路由入口**：`digital-building` / `digital-room`（在 `App.tsx` 中）。
- **主要 Props / 导出**：`userRole`、`subView`（如 `'building' | 'room'`，在 `App.tsx` 中可见）。
- **关键状态 / 数据流**：
  - 根据 `subView` 切换不同子视图。
  - 可能承载 GIS/三维、台账与采集流程。
- **关键依赖**：可能依赖 `Cesium` / 地图选择器 `MapLocationPicker`。
- **扩展点**：
  - 将采集/台账 API 抽到 `services/assetsDigitalization`。
  - 增加数据校验与导入导出。

### AssetTransfer.tsx

- **用途**：资产转固相关页面/组件（资产从在建到固定资产的流转）。
- **路由入口**：通常由资产管理模块进入；`App.tsx` 中有导入但不一定直接挂路由。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：转固流程状态、表单数据、附件/清单。
- **关键依赖**：`ProjectForm`、`BidModals`、`ContractModals` 可能相关。
- **扩展点**：对接资产系统接口；接入审批/日志（`AssetsAuditLogPage`）。

### AssetsApplyPage.tsx

- **用途**：转固申请页面。
- **路由入口**：`assets-apply`（`/hall/assets/apply`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：申请表单、材料清单、提交状态。
- **关键依赖**：可能复用 `ProjectForm`/弹窗。
- **扩展点**：
  - 对接提交接口与草稿保存。
  - 增加表单校验与附件上传。

### AssetsAuditLogPage.tsx

- **用途**：资产模块的操作记录/审计日志。
- **路由入口**：`assets-audit-log`（`/hall/assets/audit-log`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：日志列表、筛选（操作者/时间/动作）。
- **关键依赖**：表格 UI。
- **扩展点**：
  - 统一审计日志模型，支持导出（`xlsx`）。
  - 接入后端分页与检索。

### AssetsGaojibiaoPage.tsx

- **用途**：教育部高基表映射/维护（资产统计口径对齐）。
- **路由入口**：`assets-gaojibiao`（`/hall/assets/gaojibiao`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：映射关系表、校验状态。
- **关键依赖**：`xlsx`（导入/导出映射）可能使用。
- **扩展点**：把映射规则用于 `ReportsStandardPage` 生成报表。

### AssetsHomePage.tsx

- **用途**：资产转固与管理模块主页/导航页。
- **路由入口**：`assets-home`（`/hall/assets/home`）。
- **主要 Props / 导出**：`onNavigate(View)`。
- **关键状态 / 数据流**：以导航为主。
- **关键依赖**：`View` 路由体系。
- **扩展点**：将模块入口与权限配置化。

### AssetsProjectNewPage.tsx

- **用途**：新建工程项目页面（项目立项/信息录入）。
- **路由入口**：`assets-project-new`（`/hall/assets/project-new`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：项目表单数据、保存/提交。
- **关键依赖**：`ProjectForm`。
- **扩展点**：对接工程项目 API；支持项目模板。

### AssetsReviewPage.tsx

- **用途**：转固审核页面（审批、退回、流转）。
- **路由入口**：`assets-review`（`/hall/assets/review`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：审核列表、详情、审批动作。
- **关键依赖**：可能使用 `BidModals`/`ContractModals`。
- **扩展点**：
  - 接入流程中心（`ProcessCenter`）或规则引擎校验。
  - 统一审批组件。

### AssetsRoomFunctionsPage.tsx

- **用途**：房间功能划分（教学/科研/办公等用途标注与规划）。
- **路由入口**：`assets-room-functions`（`/hall/assets/room-functions`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：房间列表、功能分类、批量设置。
- **关键依赖**：`RoomFunctionPlanTab`。
- **扩展点**：
  - 接入平面图/三维房间选择。
  - 与定额核算（`RuleEngine` quota）联动。

### AssetsStockImportPage.tsx

- **用途**：存量房产导入（Excel 导入）。
- **路由入口**：`assets-stock-import`（`/hall/assets/stock-import`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：
  - 文件上传、解析（`xlsx`）、字段映射、校验错误列表。
- **关键依赖**：`xlsx`。
- **扩展点**：
  - 支持模板下载、错误行导出。
  - 导入接口异步任务化（支持大文件）。

### BidModals.tsx

- **用途**：招投标相关弹窗组件（查看/编辑标书、供应商等）。
- **路由入口**：通常被工程项目/合同页面引用。
- **主要 Props / 导出**：导出若干 Modal 组件或一个集合组件。
- **关键状态 / 数据流**：弹窗开关、表单状态。
- **关键依赖**：React、UI。
- **扩展点**：抽离为通用 Modal 基础组件，统一表单校验。

### BigScreen.tsx

- **用途**：大屏模式页面（驾驶舱大屏）。
- **路由入口**：`App.tsx` 中通过 `isBigScreen` 分支渲染（不是 react-router 的 path）。
- **主要 Props / 导出**：`onExit()`（从 `App.tsx` 可见）。
- **关键状态 / 数据流**：全屏展示图表/地图，可能复用 `Dashboard` 的数据。
- **关键依赖**：`recharts`、可能 `Cesium`。
- **扩展点**：
  - 抽取大屏的数据聚合层。
  - 支持自动轮播与多分辨率适配。

### BusinessHall.tsx

- **用途**：业务大厅（Hub）页面，作为模块入口聚合。
- **路由入口**：`hall`（`/hall`）。
- **主要 Props / 导出**：`userRole`、`onNavigate(View)`。
- **关键状态 / 数据流**：根据角色展示入口卡片。
- **关键依赖**：`View` 路由体系。
- **扩展点**：改为后端驱动的菜单/权限。

### Campus3DView.tsx

- **用途**：三维校区视图（Cesium/三维交互），供 `Dashboard`/数字化模块使用。
- **路由入口**：被 `Dashboard` 直接引用。
- **主要 Props / 导出**：
  - 默认导出 React 组件。
  - 可能导出 `Campus3DViewHandle`（从 `Dashboard` 可见）供父组件调用（如 `resetView()`）。
- **关键状态 / 数据流**：
  - Cesium viewer 初始化、图层叠加、建筑选择回调。
- **关键依赖**：`cesium`、`@types/cesium`。
- **扩展点**：
  - 接入真实楼栋/房间 GIS 数据。
  - 支持楼层/房间级拾取与高亮。

### CommercialHousing.tsx

- **用途**：经营性用房模块（游客/教师也可访问的公开视图）。
- **路由入口**：游客登录时 `App.tsx` 直接渲染；同时 `commercial`/`commercial-mgmt` 等路由分支也会进入相关页面。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：
  - 房源列表、合同/租金信息展示、筛选。
- **关键依赖**：可能复用 `CommercialHousingOverview`/`CommercialOverviewOccupancyDonut`。
- **扩展点**：
  - 对接房源/合同/租金接口。
  - 增加权限字段（游客脱敏）。

### CommercialHousingEnhanced.tsx

- **用途**：经营性用房的增强版页面（更丰富交互/统计）。
- **路由入口**：不一定直接挂路由，可能被 `CommercialHousing` 切换使用。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：更复杂的筛选与统计。
- **关键依赖**：`recharts`。
- **扩展点**：拆分为 overview/spaces/contracts 子组件。

### CommercialHousingOverview.tsx

- **用途**：经营性用房概览子组件/页面。
- **路由入口**：可能用于 `commercial-overview`（`/hall/commercial-mgmt/overview`）或被 `CommercialManagementOverview` 引用。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：经营指标、入住率、收入等图表。
- **关键依赖**：`recharts`、`CommercialOverviewOccupancyDonut`。
- **扩展点**：后端统计口径统一。

### CommercialManagementAnalytics.tsx

- **用途**：经营性用房数据分析页面。
- **路由入口**：`commercial-analytics`（`/hall/commercial-mgmt/analytics`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：统计维度选择、图表。
- **关键依赖**：`recharts`。
- **扩展点**：支持按楼栋/业态/合同状态钻取。

### CommercialManagementContracts.tsx

- **用途**：合同管理页面。
- **路由入口**：`commercial-contracts`（`/hall/commercial-mgmt/contracts`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：合同列表、编辑/续签/终止弹窗。
- **关键依赖**：`ContractModals`。
- **扩展点**：合同模板、附件上传、审批流。

### CommercialManagementHome.tsx

- **用途**：经营性用房管理主页（入口/概览）。
- **路由入口**：`commercial-home`（`/hall/commercial-mgmt/home`）。
- **主要 Props / 导出**：`userRole`、`onNavigate(View)`。
- **关键状态 / 数据流**：导航为主。
- **关键依赖**：`View`。
- **扩展点**：菜单配置化。

### CommercialManagementOverview.tsx

- **用途**：经营性用房“经营概览”页面。
- **路由入口**：`commercial-overview`（`/hall/commercial-mgmt/overview`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：经营指标卡片、图表。
- **关键依赖**：`recharts`。
- **扩展点**：后端对账/收入口径。

### CommercialManagementRent.tsx

- **用途**：租金管理页面（应收/已收、欠费、账期）。
- **路由入口**：`commercial-rent`（`/hall/commercial-mgmt/rent`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：账期选择、租金记录、催缴。
- **关键依赖**：可能与收费模块相似。
- **扩展点**：打通 `FeeManagement` 的支付/账单能力。

### CommercialManagementSpaces.tsx

- **用途**：房源管理页面（铺位/房源信息维护）。
- **路由入口**：`commercial-spaces`（`/hall/commercial-mgmt/spaces`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：房源列表、编辑。
- **关键依赖**：地图/位置选择器（如 `MapLocationPicker`）。
- **扩展点**：支持批量导入导出、GIS 绑定。

### CommercialOverviewOccupancyDonut.tsx

- **用途**：入住率/出租率环形图组件（经营性用房概览用）。
- **路由入口**：被概览页面引用。
- **主要 Props / 导出**：通常接收占用率数值与颜色配置。
- **关键状态 / 数据流**：纯展示组件为主。
- **关键依赖**：`recharts`。
- **扩展点**：统一图表组件库。

### ContractModals.tsx

- **用途**：合同相关弹窗集合（新增/编辑/查看/终止等）。
- **路由入口**：被合同管理、资产转固等页面引用。
- **主要 Props / 导出**：多个 modal 组件。
- **关键状态 / 数据流**：弹窗开关、表单。
- **关键依赖**：React。
- **扩展点**：
  - 抽象表单 schema。
  - 接入附件上传。

### Dashboard.tsx

- **用途**：决策驾驶仓/领导驾驶舱主页面。
- **路由入口**：`cockpit`（`/`，由 `App.tsx` 映射）。
- **主要 Props / 导出**：
  - `DashboardProps`: `userRole: UserRole`、`onEnterBigScreen?: () => void`
  - 默认导出 `Dashboard`。
- **关键状态 / 数据流**：
  - 根据 `userRole` 分三套 UI：`AssetAdmin`（领导驾驶舱）、`CollegeAdmin`（学院概览）、`Teacher`（个人入口）。
  - `AssetAdmin` 下包含 GIS 状态：`mapView`、`selectedBuilding`、`mapOverlay`、`showAllAlerts`。
  - 依赖 `Campus3DView` 的 ref（`Campus3DViewHandle`）调用 `resetView()`。
  - 图表数据与 KPI 多为本地 Mock 常量。
- **关键依赖**：
  - `lucide-react`（图标）
  - `recharts`（图表）
  - `MOCK_ALERTS`（`constants.ts`）
  - `Campus3DView`
- **扩展点**：
  - 将 KPI、趋势、学院对比数据接入后端接口。
  - 将“预警跳转 url”统一改为 `react-router-dom` 的 `navigate`，避免 `window.location.href` 导致整页刷新。

### FeeManagement.tsx

- **用途**：收费管理模块整体容器/页面（可能为旧版入口）。
- **路由入口**：`App.tsx` 中可能未直接挂载，主入口为 `fees-*` 系列。
- **主要 Props / 导出**：可能接收 `userRole`。
- **关键状态 / 数据流**：收费策略、账单、缴费记录等。
- **关键依赖**：与 `FeeManagementHome/Overview/Persons/Bills/Payments/Reminders` 相关。
- **扩展点**：统一收费领域模型（账单、应收、实收、减免）。

### FeeManagementBills.tsx

- **用途**：账单管理页面。
- **路由入口**：`fees-bills`（`/hall/fees/bills`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：账单列表、筛选、导出。
- **关键依赖**：`xlsx`（导出/导入）可能使用。
- **扩展点**：对接支付/对账；支持催缴联动。

### FeeManagementHome.tsx

- **用途**：收费管理模块主页（入口聚合）。
- **路由入口**：`fees-home`（`/hall/fees/home`）。
- **主要 Props / 导出**：`userRole`、`onNavigate(View)`。
- **关键状态 / 数据流**：导航为主。
- **关键依赖**：`View`。
- **扩展点**：将入口卡片配置化。

### FeeManagementOverview.tsx

- **用途**：费用总览页面。
- **路由入口**：`fees-overview`（`/hall/fees/overview`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：统计卡片、图表。
- **关键依赖**：`recharts`。
- **扩展点**：统一统计口径（按部门/房间/人员）。

### FeeManagementPayments.tsx

- **用途**：缴费记录页面。
- **路由入口**：`fees-payments`（`/hall/fees/payments`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：缴费流水、账期筛选。
- **关键依赖**：表格 UI。
- **扩展点**：对接支付平台回调/对账。

### FeeManagementPersons.tsx

- **用途**：个人缴费/人员维度费用管理页面。
- **路由入口**：`fees-persons`（`/hall/fees/persons`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：人员列表、费用明细。
- **关键依赖**：`constants/personFeeData.ts` 可能作为 Mock。
- **扩展点**：与人事/组织结构系统对接。

### FeeManagementReminders.tsx

- **用途**：催缴管理页面。
- **路由入口**：`fees-reminders`（`/hall/fees/reminders`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：催缴任务、通知状态。
- **关键依赖**：可能依赖 `@google/genai` 用于生成催缴文案（如有）。
- **扩展点**：接入短信/邮件/站内信。

### HousingAllocation.tsx

- **用途**：公用房归口调配管理（可能旧版容器）。
- **路由入口**：主入口为 `allocation-*` 系列。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：审批、资源、调整、记录、分析。
- **关键依赖**：与 `HousingAllocationHome/...` 子页面相关。
- **扩展点**：抽象“调配单”领域模型。

### HousingAllocationAdjust.tsx

- **用途**：用房调整页面。
- **路由入口**：`allocation-adjust`（`/hall/allocation/adjust`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：调整申请、房间变更、校验。
- **关键依赖**：可能依赖规则引擎 quota。
- **扩展点**：接入审批流/变更历史。

### HousingAllocationAnalytics.tsx

- **用途**：调配数据分析页面。
- **路由入口**：`allocation-analytics`（`/hall/allocation/analytics`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：图表、统计维度。
- **关键依赖**：`recharts`。
- **扩展点**：支持按学院/楼栋/用途钻取。

### HousingAllocationApproval.tsx

- **用途**：用房审批页面。
- **路由入口**：`allocation-approval`（`/hall/allocation/approval`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：审批列表、详情、同意/退回。
- **关键依赖**：可能复用流程组件。
- **扩展点**：与 `ProcessCenter` 统一。

### HousingAllocationHome.tsx

- **用途**：调配管理模块主页。
- **路由入口**：`allocation-home`（`/hall/allocation/home`）。
- **主要 Props / 导出**：`userRole`、`onNavigate(View)`。
- **关键状态 / 数据流**：导航为主。
- **关键依赖**：`View`。
- **扩展点**：入口配置化。

### HousingAllocationRecords.tsx

- **用途**：调整记录/历史页面。
- **路由入口**：`allocation-records`（`/hall/allocation/records`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：记录列表、导出。
- **关键依赖**：`xlsx` 可能使用。
- **扩展点**：服务端检索与导出任务。

### HousingAllocationResource.tsx

- **用途**：房源分配页面。
- **路由入口**：`allocation-resource`（`/hall/allocation/resource`）。
- **主要 Props / 导出**：`userRole`。
- **关键状态 / 数据流**：资源池、候选房间、分配结果。
- **关键依赖**：地图/房间功能。
- **扩展点**：算法与规则配置化。

### InventoryAnalyticsPage.tsx

- **用途**：房产盘点统计分析页面。
- **路由入口**：`inventory-analytics`（`/hall/inventory/analytics`）。
- **主要 Props / 导出**：可能无 props 或少量 props。
- **关键状态 / 数据流**：盘点统计、差异趋势。
- **关键依赖**：`recharts`。
- **扩展点**：接入盘点任务数据。

### InventoryCheck.tsx

- **用途**：盘点核查基础版页面。
- **路由入口**：可能被 `InventoryCheckEnhanced` 替代。
- **主要 Props / 导出**：默认导出 React 组件。
- **关键状态 / 数据流**：盘点表单、扫码/定位等（如有）。
- **关键依赖**：可能使用 `MapLocationPicker`。
- **扩展点**：抽离通用“盘点表单”组件。

### InventoryCheckEnhanced.tsx

- **用途**：盘点核查增强版页面。
- **路由入口**：`App.tsx` 中导入但路由上主入口为 `inventory-*` 页面；可能由某处按钮进入。
- **主要 Props / 导出**：默认导出组件。
- **关键状态 / 数据流**：更多的任务流/差异处理。
- **关键依赖**：与 `InventoryTasksPage`、`InventoryDiscrepanciesPage` 相关。
- **扩展点**：统一盘点任务状态机。

### InventoryDiscrepanciesPage.tsx

- **用途**：差异处理页面。
- **路由入口**：`inventory-discrepancies`（`/hall/inventory/discrepancies`）。
- **主要 Props / 导出**：默认导出组件。
- **关键状态 / 数据流**：差异列表、确认/申诉。
- **关键依赖**：表格。
- **扩展点**：对接工单/审批。

### InventoryHomePage.tsx

- **用途**：盘点核查主页。
- **路由入口**：`inventory-home`（`/hall/inventory/home`）。
- **主要 Props / 导出**：`onNavigate(View)`。
- **关键状态 / 数据流**：导航为主。
- **关键依赖**：`View`。
- **扩展点**：入口配置化。

### InventoryTasksPage.tsx

- **用途**：盘点任务列表页面。
- **路由入口**：`inventory-tasks`（`/hall/inventory/tasks`）。
- **主要 Props / 导出**：默认导出组件。
- **关键状态 / 数据流**：任务列表、开始/结束任务。
- **关键依赖**：表格。
- **扩展点**：任务分配与进度统计。

### Login.tsx

- **用途**：登录页（选择角色 + 简易账号/密码/验证码登录 UI）。
- **路由入口**：不是路由页面；由 `App.tsx` 在 `!isLoggedIn` 时直接渲染。
- **主要 Props / 导出**：
  - `LoginProps`: `onLogin: (role: UserRole) => void`
  - 默认导出 `Login`
- **关键状态 / 数据流**：
  - `activeTab`：账号登录/验证码登录的 tab。
  - `selectedRole`：选择登录角色，提交时 `onLogin(selectedRole)`。
  - 输入框当前为 `defaultValue`，未与状态绑定（纯 UI）。
- **关键依赖**：`UserRole`（`types.ts`）、`lucide-react`。
- **扩展点**：
  - 替换为真实认证（调用后端登录接口，保存 token）。
  - 将“角色选择”从 UI Mock 改为后端返回的用户角色。

### Maintenance.tsx / MaintenanceEnhanced.tsx

- **用途**：维修与物业模块页面（基础版/增强版）。
- **路由入口**：主入口为 `maintenance-*` 系列，其中 `MaintenanceHome/Repair/Property/Stats` 是路由直达。
- **主要 Props / 导出**：多为 `userRole`。
- **关键状态 / 数据流**：工单列表、报修单、统计。
- **关键依赖**：可能依赖 `AlertLogs`。
- **扩展点**：
  - 统一工单状态机。
  - 对接消息通知。

### MaintenanceHome.tsx / MaintenanceRepair.tsx / MaintenanceProperty.tsx / MaintenanceStats.tsx

- **用途**：维修与物业子模块：首页、维修工单、物业服务、统计。
- **路由入口**：
  - `maintenance-home`（`/hall/maintenance/home`）
  - `maintenance-repair`（`/hall/maintenance/repair`）
  - `maintenance-property`（`/hall/maintenance/property`）
  - `maintenance-stats`（`/hall/maintenance/stats`）
- **主要 Props / 导出**：`userRole`（Home 还会接 `onNavigate(View)`）。
- **关键状态 / 数据流**：列表、筛选、表单、统计。
- **关键依赖**：`recharts`（Stats）。
- **扩展点**：
  - 工单与资产/房间实体关联。
  - 接入 SLA 与催办。

### MapLocationPicker.tsx

- **用途**：地图位置选择器组件（选择点位/经纬度/位置）。
- **路由入口**：被房源管理、数字化采集等页面引用。
- **主要 Props / 导出**：通常接收初始坐标与 `onChange`。
- **关键状态 / 数据流**：当前位置、拖拽/点击事件。
- **关键依赖**：若未用第三方地图 SDK，则可能为简单 mock。
- **扩展点**：替换为高德/腾讯/Mapbox/Cesium pick。

### MyTodos.tsx

- **用途**：我的代办页面（资产管理员可见）。
- **路由入口**：`todos`（`/todos`）。
- **主要 Props / 导出**：`onNavigate: (view: View) => void`（从 `App.tsx` 可见传入）。
- **关键状态 / 数据流**：待办列表、处理动作、跳转到具体模块。
- **关键依赖**：`View`。
- **扩展点**：对接流程中心/待办中心接口。

### PersonFeeManagement.tsx

- **用途**：个人费用管理（可能为收费模块中的子视图/旧页面）。
- **路由入口**：可能被 `FeeManagementPersons` 引用。
- **主要 Props / 导出**：默认导出组件。
- **关键状态 / 数据流**：个人费用明细。
- **关键依赖**：`constants/personFeeData.ts`。
- **扩展点**：与收费后端对接。

### ProcessCenter.tsx

- **用途**：流程中心（审批流、任务流转、节点查看）。
- **路由入口**：可能由代办或审批页面入口进入。
- **主要 Props / 导出**：默认导出组件。
- **关键状态 / 数据流**：流程定义、实例状态。
- **关键依赖**：可能与 `RuleEngine` 联动。
- **扩展点**：接入工作流引擎（Flowable/Camunda 等）或自研流程服务。

### ProjectForm.tsx

- **用途**：工程项目表单组件（新建项目、项目编辑共用）。
- **路由入口**：被 `AssetsProjectNewPage` 等引用。
- **主要 Props / 导出**：表单初始值、提交回调等。
- **关键状态 / 数据流**：表单字段 state、校验。
- **关键依赖**：React。
- **扩展点**：
  - 抽象字段 schema。
  - 与后端字典/枚举打通。

### PublicHouse*（综合查询系列）

这些文件整体属于 **公房综合查询** 模块，路由入口在 `App.tsx`：

- `public-house-home`：`/hall/public-house-query/home`
- `public-house-one-person-multi-room`：`/hall/public-house-query/one-person-multi-room`
- `public-house-one-room-multi-person`：`/hall/public-house-query/one-room-multi-person`
- `public-house-dept-overview`：`/hall/public-house-query/dept-overview`
- `public-house-quota`：`/hall/public-house-query/quota`
- `public-house-room-usage`：`/hall/public-house-query/room-usage`
- `public-house-commercial`：`/hall/public-house-query/commercial`

对应文件：

- **PublicHouseQueryHome.tsx**：模块首页（`onNavigate(View)`）。
- **PublicHouseOnePersonMultiRoomQuery.tsx**：一人多房查询页面。
- **PublicHouseOneRoomMultiPersonQuery.tsx**：一房多人查询页面。
- **PublicHouseDeptOverviewQuery.tsx**：部门概况查询页面。
- **PublicHouseQuotaQuery.tsx**：定额查询页面。
- **PublicHouseRoomUsageQueryPage.tsx**：公用房查询页面（页面级）。
- **PublicHouseCommercialQueryPage.tsx**：商用房查询页面（页面级）。

另外还存在 `PublicHouseCommercialQuery.tsx`、`PublicHouseRoomUsageQuery.tsx`、`PublicHouseDeptOverview.tsx`、`PublicHouseOnePersonMultiRoom.tsx`、`PublicHouseOneRoomMultiPerson.tsx`、`PublicHouseQuotaManagement.tsx` 等：

- **用途**：更偏组件化/旧版实现，可能被 `*Page` 或 `*Query` 文件组合使用。
- **扩展点**：建议逐步统一为“Page（路由直达） + 子组件（复用）”的结构，避免同名功能重复。

### ReportCenter.tsx / ReportCenterEnhanced.tsx

- **用途**：报表中心（基础版/增强版）。
- **路由入口**：当前 `App.tsx` 使用的是 `ReportCenterEnhanced` 与 `Reports*Page` 分组。
- **主要 Props / 导出**：多为 `userRole`。
- **关键状态 / 数据流**：报表配置、生成、导出。
- **关键依赖**：`xlsx`、`react-markdown`（若报表有说明/AI 输出）。
- **扩展点**：报表模板化与异步导出。

### ReportsHomePage.tsx / ReportsStandardPage.tsx / ReportsCustomPage.tsx / ReportsLogsPage.tsx

- **用途**：统计报表中心：主页、标准报表（高基表）、自定义报表、日志。
- **路由入口**：
  - `reports-home`（`/hall/reports/home`）
  - `reports-standard`（`/hall/reports/standard`）
  - `reports-custom`（`/hall/reports/custom`）
  - `reports-logs`（`/hall/reports/logs`）
- **主要 Props / 导出**：`ReportsHomePage` 接 `onNavigate(View)`；其他多接 `userRole`。
- **关键状态 / 数据流**：报表参数、预览、导出。
- **关键依赖**：`xlsx`。
- **扩展点**：
  - 与 `AssetsGaojibiaoPage` 的映射规则联动。
  - 增加权限/审计。

### RoomFunctionPlanTab.tsx

- **用途**：房间功能划分的 Tab/规划子组件。
- **路由入口**：被 `AssetsRoomFunctionsPage` 引用。
- **主要 Props / 导出**：tab key、数据、回调。
- **关键状态 / 数据流**：tab 切换、编辑。
- **关键依赖**：React。
- **扩展点**：抽象为通用 `Tabs`/`PlanEditor`。

### RuleEngine.tsx

- **用途**：规则引擎配置页面（定额核算/收费策略/预警规则）。
- **路由入口**：
  - `rules-quota`：`/rules/quota`
  - `rules-fee`：`/rules/fee`
  - `rules-alert`：`/rules/alert`
- **主要 Props / 导出**：`subView`（从 `App.tsx` 可见）。
- **关键状态 / 数据流**：规则配置表单、保存。
- **关键依赖**：可能使用 `react-markdown`/`@google/genai` 做辅助生成。
- **扩展点**：
  - 将规则持久化到后端。
  - 规则版本管理与发布。

---


