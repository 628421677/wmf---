# components（模块 5）公用房归口调配管理（HousingAllocation）

本模块对应 `App.tsx` 中业务大厅 -> **公用房归口调配管理**：

- `allocation-home` -> `/hall/allocation/home`
- `allocation-approval` -> `/hall/allocation/approval`
- `allocation-resource` -> `/hall/allocation/resource`
- `allocation-adjust` -> `/hall/allocation/adjust`
- `allocation-records` -> `/hall/allocation/records`
- `allocation-analytics` -> `/hall/allocation/analytics`

> 结构特点：
>
>- `HousingAllocationHome.tsx` 是模块入口。
>- `HousingAllocationApproval/Resource/Adjust/Records/Analytics.tsx` 都是 **wrapper**，复用 `HousingAllocation.tsx` 这个“超级页面”，并通过 `initialTab` 指定默认 tab。
>- `HousingAllocation.tsx` 内部同时涵盖：用房申请分级审批、房源库存维护与直接分配、用房调整（换房/退房/临时借用）、调配记录与数据分析。
>
> 另外：本模块与资产模块存在联动：
>
>- `HousingAllocation.tsx` 会读取 `utils/assetRoomSync.getStoredRooms()`（即 `uniassets-rooms-v1`）用于“房源分配-新增”时提供楼栋/房间号/楼层/面积的可选项（归档项目同步出来的房间台账）。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## HousingAllocationHome.tsx

- **用途**：调配管理模块主页（入口导航）。
- **路由入口**：`allocation-home`（`/hall/allocation/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: View) => void; userRole: UserRole }`
  - 默认导出 `HousingAllocationHome`
  - 当前实现仅使用 `onNavigate`，未使用 `userRole`。
- **关键状态 / 数据流**：
  - `modules` 定义 5 个入口卡片：
    - `allocation-approval`（用房审批）
    - `allocation-resource`（房源分配）
    - `allocation-adjust`（用房调整）
    - `allocation-records`（调整记录）
    - `allocation-analytics`（数据分析）
  - 点击卡片 `onNavigate(mod.id)` 由 `App.tsx` 切换 `currentView`。
- **关键依赖**：`View`（App 路由类型）、`lucide-react`。
- **扩展点**：入口按角色/权限配置化。

## HousingAllocationApproval.tsx / HousingAllocationResource.tsx / HousingAllocationAdjust.tsx / HousingAllocationRecords.tsx / HousingAllocationAnalytics.tsx

- **用途**：路由 wrapper：将不同路由映射到 `HousingAllocation.tsx` 的不同 tab。
- **路由入口**：
  - `allocation-approval` / `allocation-resource` / `allocation-adjust` / `allocation-records` / `allocation-analytics`
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出组件；内部渲染：
    - `<HousingAllocation userRole={userRole} initialTab="..." hideTabNav />`
- **关键状态 / 数据流**：无。
- **关键依赖**：`HousingAllocation`。
- **扩展点**：
  - 可在 wrapper 层做权限拦截（例如教师只允许“新增申请/退房”，不可管理房源库存）。

---

## HousingAllocation.tsx（模块核心聚合页，已分段阅读）

- **用途**：调配管理的“超级页面”，提供 5 个 tab：
  - `requests`：用房审批（分级审批 + 批量审批 + 配房）
  - `allocation`：房源分配（库存维护 + 编辑/直接分配 + 导出）
  - `returns`：用房调整（换房/退房/临时借用到期提醒）
  - `history`：调配记录（筛选/导出）
  - `analytics`：数据分析（申请/房源统计）

- **主要 Props / 导出**：
  - Props：
    - `userRole: UserRole`
    - `initialTab?: 'requests' | 'allocation' | 'returns' | 'history' | 'analytics'`（默认 `requests`）
    - `hideTabNav?: boolean`（默认 false）
  - 默认导出 `HousingAllocation`

- **关键状态 / 数据流**：

  ### 1) localStorage 数据源（文件内自带 useLocalStorage）

  - 本文件内实现了一个简化版 `useLocalStorage`（直接操作 `window.localStorage`），与项目通用 `../hooks/useLocalStorage` 不同。
  - 主要 keys：
    - `housing-requests-v2`：`ExtendedRoomRequest[]`（用房申请）
    - `available-rooms`：`AvailableRoom[]`（房源库存）
    - `allocation-records-v2`：`AllocationRecord[]`（调配记录）
    - `room-adjustment-requests-v1`：`RoomAdjustmentRequest[]`（用房调整/换房申请）
    - `housing-allocation-notifications-v1`：通知日志（演示用）

  ### 2) 与资产模块的房间台账联动（归档房间）

  - 调用 `seedDemoRoomsIfEmpty()`：确保 `uniassets-rooms-v1` 里存在演示房间（避免下拉为空）。
  - `archivedProjectRooms = getStoredRooms()`：读取 `uniassets-rooms-v1`。
  - 用于“房源分配 -> 新增房源”弹窗的级联下拉：
    - `archivedBuildings`：楼栋列表
    - `archivedRoomNosByBuilding`：楼栋 -> 房间号
    - `archivedFloorsByBuildingRoomNo`：楼栋+房间号 -> 楼层
    - `findArchivedRoomArea(building, roomNo, floor)`：自动回填面积（只读）。

  ### 3) 权限/冻结逻辑（与收费模块联动的简化演示）

  - `myDepartmentName`：根据 role 映射部门名。
  - `myFeeStatus = MOCK_FEES.find(...)`；`isBlocked = !isPaid && excessCost > 0`。
  - 当 `isBlocked` 且用户是 `CollegeAdmin`：展示欠费冻结提示，并禁用“新增用房申请”。

  ### 4) 统计与筛选

  - `stats` 聚合：待审批数、已批准、可分配房源数与面积、待审批调整单、临借到期等。
  - `filteredRequests`：按关键字/状态/部门/日期范围/面积范围筛选。
  - `filteredRooms`：按关键字/楼栋/类型/状态筛选。
  - `filteredHistory`：按房间/楼栋/接收部门关键字与类型筛选。

  ### 5) 申请审批（requests tab）

  - `getApprovalLevel(area)`：>=1000 => 3 级；>=500 => 2 级；否则 1 级。
  - `handleApprove(req)`：
    - 按当前审批层级与 requiredLevel 决定：
      - 未到 requiredLevel：状态从 `PendingLevel1 -> PendingLevel2 -> PendingLevel3`（action=Forward）
      - 到达 requiredLevel：状态变为 `Approved`（action=Approve）
    - 追加 `ApprovalRecord`。
  - `handleBatchApprove()`：对选中的 pending request 逐个调用 `handleApprove`。
  - `handleReject()`：将选中 request 状态置为 `Rejected` 并写入 `ApprovalRecord(action=Reject)`。

  ### 6) 配房（从申请驱动）

  - `handleAllocate()`：
    - 将 request 状态置为 `Allocated` 并写入 `allocatedRooms`。
    - 将选中的房源 `availability` 改为 `Occupied`。
    - 生成 `AllocationRecord(allocationType='New')` 写入 `allocation-records-v2`。
    - 写通知日志并 `alert`。

  ### 7) 房源库存编辑/直接分配（allocation tab）

  - `openRoomModal(room)`：将 `AvailableRoom` 映射到 `roomForm`，并对设施里的“其他:”做拆分。
  - `saveRoomOnly()`：仅保存房源基本信息（新增或更新）。
  - `saveAndAllocateRoom()`：
    - 同时写入分配对象（部门或个人）到 `assigneeDept/assigneePerson`。
    - 写入一条 `AllocationRecord(allocationType='New')`（direct allocate）并写通知。

  ### 8) 用房调整（returns tab）

  - 文件里 `returnRequests` 实际包含两种语义：
    - `RoomAdjustmentRequest[]`：换房/调整（CHG-xxx）
    - 另有 `newReturn`/`handleSubmitReturn` 生成的 `RoomReturnRequest`（退房），但 state 类型与 UI 展示存在概念混用（属于演示代码不一致点）。
  - `handleApproveReturn(ret)` / `openAdjustmentAllocate(ret)` / `handleAllocateAdjustment()`：
    - 处理“换房调整”流程：Approved -> Allocated -> Completed。
    - 配房会写 `AllocationRecord(allocationType='Adjust')` 并占用新房源。
  - 临时借用：`temporaryBorrows` 使用 mock，展示到期提醒（<=30 天）。

  ### 9) 导出

  - `handleExport('requests'|'rooms'|'history')`：生成 CSV + Blob 下载。

- **关键依赖**：
  - `lucide-react`
  - `constants`：
    - `MOCK_EXTENDED_REQUESTS/MOCK_AVAILABLE_ROOMS/MOCK_ALLOCATION_RECORDS/MOCK_RETURN_REQUESTS/MOCK_TEMPORARY_BORROWS`
    - `MOCK_FEES`（用于欠费冻结演示）
  - `types`：`AllocationStatus/RoomUseType/RoomAvailability/ExtendedRoomRequest/AvailableRoom/AllocationRecord/...`
  - `utils/assetRoomSync`：`getStoredRooms/seedDemoRoomsIfEmpty`（归档房间台账联动）

- **扩展点（重要）**：
  - 建议统一全项目 `useLocalStorage` 实现（此文件与 FeeManagement 等各自实现了一份）。
  - `returnRequests` 混用了调整与退房两套类型，建议拆成两个 state（`adjustmentRequests` 与 `returnRequests`）并分 UI。
  - 欠费冻结应改为调用收费模块/后端的真实状态，而不是 `MOCK_FEES`。
  - “归档房间台账 -> 房源库存”建议由后端同步，避免前端通过下拉人工新增造成不一致。

---

## 状态

- **模块 5 初版已完成**：已覆盖入口页、wrapper，以及核心 `HousingAllocation.tsx` 的关键数据流与联动点。

