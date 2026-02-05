# components（模块 3）公寓与宿舍管理（Apartment）

本模块主要对应 `App.tsx` 中业务大厅 -> **公寓与宿舍管理**：

- `residence-home` -> `/hall/residence-mgmt/home`
- `apartment-overview` -> `/hall/residence-mgmt/overview`
- `apartment-applications` -> `/hall/residence-mgmt/applications`
- `apartment-rooms` -> `/hall/residence-mgmt/rooms`
- `apartment-utilities` -> `/hall/residence-mgmt/utilities`
- `apartment-deposits` -> `/hall/residence-mgmt/deposits`
- `apartment-allocation` -> `/hall/residence-mgmt/allocation`

> 重要：当前项目的“公寓/宿舍”业务存在**两条实现路径**：
>
>- **路径 A（wrapper 复用）**：大量 `ApartmentManagement*` 页面实际复用 `CommercialHousing.tsx` 内的 apartment 子域（`initialMainTab="apartment"`）。
>- **路径 B（房间台账 + 分配）**：`ApartmentManagementRoomsPage.tsx`、`ApartmentRoomAllocationPage.tsx` 直接基于 `uniassets-rooms-v1`（由资产转固模块同步）实现房间与分配。
>
>后续如要收敛架构，建议把 apartment 子域从 `CommercialHousing.tsx` 拆出到 `apartment/` 目录，并统一数据源。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## ApartmentManagementHome.tsx

- **用途**：公寓与宿舍管理模块主页（入口导航）。
- **路由入口**：`residence-home`（`/hall/residence-mgmt/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: View) => void; userRole: UserRole }`
  - 默认导出 `ApartmentManagementHome`
  - 当前实现仅使用 `onNavigate`，未使用 `userRole`。
- **关键状态 / 数据流**：
  - `modules` 数组定义 6 个入口：
    - `apartment-overview`、`apartment-applications`、`apartment-rooms`、`apartment-utilities`、`apartment-deposits`、`apartment-allocation`
  - `apartment-allocation` 的文案明确指出：房源来自“资产转固同步房间台账”。
- **关键依赖**：`View`（App 路由类型）、`lucide-react`。
- **扩展点**：
  - 入口按 `userRole` 做可见性/可点击控制。
  - 将“房源来自资产同步”的状态/健康度（是否已同步）做提示。

## ApartmentManagementOverview.tsx

- **用途**：公寓/宿舍“居住概览”的路由页包装器。
- **路由入口**：`apartment-overview`（`/hall/residence-mgmt/overview`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `ApartmentManagementOverview`
- **关键状态 / 数据流**：无（纯 wrapper）。
- **关键依赖**：复用 `CommercialHousing`：
  - `initialMainTab="apartment"`
  - `initialApartmentTab="overview"`
  - `hideMainTabNav/hideSubTabNav` 隐藏 tab 导航。
- **扩展点**：后续如拆分 apartment 子域，可在此替换为独立实现。

## ApartmentManagementApplications.tsx / ApartmentManagementUtilities.tsx / ApartmentManagementDeposits.tsx

- **用途**：分别对应入住申请 / 水电管理 / 押金管理的路由页包装器。
- **路由入口**：
  - `apartment-applications`（`/hall/residence-mgmt/applications`）
  - `apartment-utilities`（`/hall/residence-mgmt/utilities`）
  - `apartment-deposits`（`/hall/residence-mgmt/deposits`）
- **主要 Props / 导出**：均为 `({ userRole }: { userRole: UserRole })` 默认导出。
- **关键状态 / 数据流**：无（纯 wrapper）。
- **关键依赖**：复用 `CommercialHousing` 的 apartment 子域：
  - `initialMainTab="apartment"`
  - `initialApartmentTab="applications/utilities/deposits"`
- **扩展点**：可在 wrapper 层做权限拦截或数据源切换。

## ApartmentManagementRooms.tsx

- **用途**：房间管理路由页的薄封装。
- **路由入口**：`apartment-rooms`（`/hall/residence-mgmt/rooms`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`（当前未使用）。
  - 默认导出 `ApartmentManagementRooms`
- **关键状态 / 数据流**：无。
- **关键依赖**：直接渲染 `ApartmentManagementRoomsPage`。
- **扩展点**：
  - 这里可以根据 `userRole` 默认切换 teacher/student tab。
  - 或改为复用 `CommercialHousing` 的 `apartmentTab='rooms'`，实现统一。

## ApartmentManagementRoomsPage.tsx

- **用途**：公寓/宿舍房间台账页面（教师公寓/学生宿舍两类 tab + 搜索）。
- **路由入口**：通过 `ApartmentManagementRooms.tsx` 在 `apartment-rooms` 路由渲染。
- **主要 Props / 导出**：
  - Props：`{ initialTab?: 'teacher' | 'student' }`，默认 `'teacher'`。
  - 默认导出 `ApartmentManagementRoomsPage`
- **关键状态 / 数据流**：
  - 数据源：`useLocalStorage<RoomAsset[]>('uniassets-rooms-v1', [])`
    - 该 key 与资产模块 `AssetsRoomFunctionsPage` 中 `upsertRoomsFromProject` 的同步目标一致。
  - UI 状态：`activeTab`（teacher/student）、`searchTerm`。
  - 分类规则：
    - 通过 `functionSub`（`(r as any).functionSub`）判断房间属于教师/学生：
      - teacher：`staffturnover` / `teacherapartment` / `教职工周转房`
      - student：`studentdorm` / `studentdormitory` / `学生宿舍`
    - 这与资产模块里自动补 `subCategory`（`StaffTurnover/StudentDorm`）存在大小写差异，需要注意。
  - 搜索：匹配 `buildingName` / `roomNo` / `remark`（用于户型，如“四人间”）。
  - 展示字段：楼栋、房号、楼层、面积、户型、状态、占用部门等。
  - 空态提示：提示先在资产模块归档并同步房间。
- **关键依赖**：
  - `useLocalStorage`（hooks）
  - `RoomAsset` type
  - `lucide-react`
- **扩展点**：
  - 统一 `functionSub` 取值规范（大小写/枚举化），避免 teacher/student 误判。
  - 增加详情抽屉：展示房间功能分类、分配记录、水电押金等。
  - 将 `uniassets-rooms-v1` 改为后端房间台账接口。

## ApartmentRoomAllocationPage.tsx

- **用途**：教师房间分配页面：将教师与“可分配房间”建立关系，并同步房间占用状态。
- **路由入口**：`apartment-allocation`（`/hall/residence-mgmt/allocation`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `ApartmentRoomAllocationPage`
- **关键状态 / 数据流**：
  - 分配关系存储：`RELATIONS_KEY = 'uniassets-teacher-room-allocations-v1'`
    - 数据类型为 `PersonRoomRelation[]`。
  - 房间来源：`ROOMS_STORAGE_KEY`（来自 `utils/assetRoomSync`；实际为 `uniassets-rooms-v1`）
    - 使用 `getStoredRooms()` 读取。
    - 通过监听 `window.storage` 事件（仅跨 tab 生效）在 `roomsVersion` 上触发刷新。
  - 当前可分配房间过滤：
    - `availableRooms` 只取 `type === 'Student'` 的房间作为“宿舍/公寓房源”（注：这与“教师分配周转房”的语义可能不一致，属于业务假设/占位逻辑）。
    - 再按 `roomAssignmentsByRoomId` 标记是否已分配。
  - `assign()`：
    - 校验教师/房间已选。
    - 防重复：同一房间只能分配给一个人。
    - 写入 relation（头插）。
    - best-effort 同步房间状态：将房间 `status` 置为 `Occupied`、`department` 置为 `学院-姓名` 并写回 `setStoredRooms`。
    - 写入审计日志到 `uniassets-audit-logs`（action=update）。
  - `unassign(rel)`：
    - 删除 relation。
    - best-effort 将房间恢复为 `Empty`，清空 `department`。
    - 写审计日志。
  - 教师列表当前为本地 `MOCK_TEACHERS`。
- **关键依赖**：
  - `useLocalStorage`（auditLogs/relations）
  - `utils/assetRoomSync`：`ROOMS_STORAGE_KEY/getStoredRooms/setStoredRooms`
  - `types`：`PersonRoomRelation/RoomAsset/AuditLog`
  - `lucide-react`
- **扩展点**：
  - “可分配房间”不应硬编码 `type==='Student'`；应改为按 `functionSub`（`StaffTurnover/StudentDorm`）或按房源池配置。
  - `window.storage` 事件在同一 tab 内不会触发；如需本 tab 立即感知更新，建议直接在 `setStoredRooms` 后同时更新本地 state，或实现事件总线。
  - 将教师列表与关系落库改为后端接口，并增加权限与冲突校验。

## ApartmentHousingOverview.tsx

- **用途**：教师周转房总览（台账 + 房源状态分布图）。该组件主要被 `CommercialHousing.tsx` 的 apartment 子域引用。
- **路由入口**：非路由组件；作为子组件被上层渲染。
- **主要 Props / 导出**：
  - Props：`{ apartmentRooms: ApartmentRoom[]; apartmentApps: ApartmentApplication[]; utilityBills: UtilityBill[] }`
  - 默认导出 `ApartmentHousingOverview`
- **关键状态 / 数据流**：
  - `appsByRoomId`：将 `apartmentApps` 按 `allocatedRoomId` 建索引。
  - `unpaidByRoomId`：将 `utilityBills` 中 `status==='Unpaid'` 的房间标记为欠费。
  - `rows`：逐房间生成台账行：
    - 租期：以 `allocationDate = checkInDate || occupiedSince` 为起点，默认租期 12 个月。
    - “人才类型”通过 `title` 推断：教授=省级高层次人才，副教授/其他=青年教师（占位规则）。
    - 合规状态：当前仅对 `unpaidUtility` 返回 `欠缴费用`，其余基本为占位。
    - 退租信息：`CheckedOut` 才算退租，并用 `depositReturned` 简单映射验收结果。
  - 图表：`roomStatusData` 统计 `apartmentRooms.status` 分布，用 `recharts` 饼图展示。
- **关键依赖**：`recharts`。
- **扩展点**：
  - 合规状态、续租状态应对接真实规则与审批流程。
  - 租期计算应使用合同/分配单据日期，避免用入住日期推断。

## ApartmentHousingLedgerOverview.tsx

- **用途**：通用的“教师公寓周转房台账表格”展示组件（纯展示），用于复用 `ApartmentHousingOverview` 已构造好的台账行数据。
- **路由入口**：非路由组件，供其它页面引用。
- **主要 Props / 导出**：
  - Props：
    - `rows: ApartmentLedgerRow[]`
    - `title?: string`（默认：`教师公寓周转房总览（台账）`）
  - 默认导出 `ApartmentHousingLedgerOverview`
  - 同时导出：
    - `ApartmentLedgerRow`（台账行结构）
    - `ApartmentRenewalStatus`、`ApartmentComplianceStatus`（枚举型 string union）
- **关键状态 / 数据流**：
  - `safeRows = useMemo(() => rows ?? [], [rows])`：对 `rows` 做空值兜底。
  - 其余均为纯渲染：将 `safeRows` 映射为表格行；`rentStandard` 使用 `toLocaleString()`。
- **关键依赖**：无（仅 React）。
- **扩展点**：
  - 增加 `emptyState`（当 rows 为空时的占位提示）。
  - 支持列配置/导出（xlsx）/排序/分页。
  - 与 `ApartmentHousingOverview` 的数据结构尽量统一（当前两处都定义了 renewal/compliance 等类型，建议合并到 `types.ts`）。

---

## 状态

- **模块 3 已补全完成**：已覆盖所有 `Apartment*.tsx` 文件（含 `ApartmentHousingLedgerOverview.tsx`）。
