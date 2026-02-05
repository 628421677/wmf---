# components（模块 6）房产盘点核查（Inventory）

本模块对应 `App.tsx` 中业务大厅 -> **房产盘点核查**：

- `inventory-home` -> `/hall/inventory/home`
- `inventory-tasks` -> `/hall/inventory/tasks`
- `inventory-discrepancies` -> `/hall/inventory/discrepancies`
- `inventory-analytics` -> `/hall/inventory/analytics`

> 结构特点：
>
>- `InventoryHomePage.tsx` 是模块入口导航。
>- `InventoryTasksPage.tsx / InventoryDiscrepanciesPage.tsx / InventoryAnalyticsPage.tsx` 是目前路由直达的 3 个子页面。
>- `InventoryCheck.tsx / InventoryCheckEnhanced.tsx` 是“移动盘点/盘点核查”的两套实现（增强版更完整），但当前 `App.tsx` 并没有直接路由到它们（更像历史/备用实现或被其它页面引用）。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## InventoryHomePage.tsx

- **用途**：盘点核查模块主页（入口导航）。
- **路由入口**：`inventory-home`（`/hall/inventory/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: any) => void }`
  - 默认导出 `InventoryHomePage`
- **关键状态 / 数据流**：
  - 3 个快捷入口：
    - `inventory-tasks`（盘点任务）
    - `inventory-discrepancies`（差异处理）
    - `inventory-analytics`（统计分析）
  - 点击调用 `onNavigate('inventory-xxx')`，由 `App.tsx` 切换视图。
- **关键依赖**：`lucide-react`。
- **扩展点**：入口页增加当前季度任务概况与待处理差异提醒。

## InventoryTasksPage.tsx

- **用途**：盘点任务管理页：创建/发布盘点任务，跟踪进度，并提供“移动盘点（扫码）”演示弹窗。
- **路由入口**：`inventory-tasks`（`/hall/inventory/tasks`）。
- **主要 Props / 导出**：默认导出 `InventoryTasksPage`，无 props。
- **关键状态 / 数据流**：
  - 本页数据全部在内存 state（不落库）：
    - `tasks` 初始为 `initTasks`（含进行中/已完成/待发布/已逾期）。
    - `departments` 固定列表。
  - 过滤：`filterStatus/filterType/searchKeyword` -> `filteredTasks`。
  - 关键操作：
    - `publishTask(taskId)`：将 `待发布` 改为 `进行中`。
    - `createTask()`：用 `newTask` 表单创建新任务（status=待发布，progress=0）。
  - 弹窗：
    - `selectedTask`：查看进度弹窗（示例）。
    - `isScanModalOpen`：移动盘点扫码弹窗（完全示例 UI）。
    - `isTaskModalOpen`：新建任务弹窗。
- **关键依赖**：`lucide-react`。
- **扩展点**：
  - 将任务与执行记录持久化（localStorage 或后端）。
  - 将扫码盘点从“静态示例”替换为真实二维码解析 + 房间台账匹配 + 上报接口。

## InventoryDiscrepanciesPage.tsx

- **用途**：差异处理闭环页：对盘点发现的账实差异进行下发整改、跟踪、复核与闭环。
- **路由入口**：`inventory-discrepancies`（`/hall/inventory/discrepancies`）。
- **主要 Props / 导出**：默认导出 `InventoryDiscrepanciesPage`，无 props。
- **关键状态 / 数据流**：
  - `reports` 初始为 `initReports`（包含问题类型、状态、责任单位、处理历史等）。
  - 过滤：`filterStatus/filterType/searchKeyword` -> `filteredReports`。
  - `advanceProcess(reportId, nextStep, remark)`：
    - 将 `ProcessStep` 映射到 `DiscrepancyStatus`（statusMap）。
    - 追加 `processHistory` 记录。
  - 弹窗：
    - 详情弹窗：展示账面 vs 实际、照片占位、处理时间线。
    - 处理弹窗：演示“下发通知/闭环”动作。
- **关键依赖**：`lucide-react`。
- **扩展点**：
  - 增加整改期限超期判定（目前只展示 deadline，不自动把 status 置为已逾期）。
  - 接入工单系统或流程中心（ProcessCenter）实现真正闭环。

## InventoryAnalyticsPage.tsx

- **用途**：统计分析页：展示部门盘点进度、差异类型分布与状态统计（当前为静态示例）。
- **路由入口**：`inventory-analytics`（`/hall/inventory/analytics`）。
- **主要 Props / 导出**：默认导出 `InventoryAnalyticsPage`，无 props。
- **关键状态 / 数据流**：
  - 静态数据：
    - `deptProgressData`：部门维度应盘/已盘/差异/完成率。
    - `reports`：差异列表（只用于统计）。
  - `stats`（useMemo）：统计待处理/整改中/待复核/已闭环，并按类型计数。
  - `sendReminder(deptName)`：仅 `alert` 演示。
- **关键依赖**：`lucide-react`。
- **扩展点**：
  - 将数据来源统一为任务与差异模块的真实数据。
  - 引入 `recharts` 做可视化（当前为手写进度条）。

---

## InventoryCheck.tsx（备用/简版）

- **用途**：盘点核查简版单页（任务列表 + 差异表 + 扫码弹窗）。
- **路由入口**：当前未在 `App.tsx` 路由直达。
- **主要 Props / 导出**：默认导出 `InventoryCheck`。
- **关键状态 / 数据流**：仅本地 state + mock。
- **扩展点**：可删除或保留为 demo；建议与 `InventoryCheckEnhanced` 二选一作为主线。

## InventoryCheckEnhanced.tsx（备用/增强版）

- **用途**：盘点核查增强版单页：任务/差异/统计 3 tab，包含更完整的流程步骤展示与处理弹窗。
- **路由入口**：当前未在 `App.tsx` 路由直达。
- **主要 Props / 导出**：默认导出 `InventoryCheckEnhanced`。
- **关键状态 / 数据流**：
  - 本地 state + mock 数据（tasks/reports/checkHistory/deptProgressData）。
  - `advanceProcess` 推进差异闭环。
- **扩展点**：
  - 与现有路由页（Tasks/Discrepancies/Analytics）存在功能重复，建议收敛为“一个聚合页 + 路由拆分”或“多页 + 公用组件”。

---

## 状态

- **模块 6 初版已完成**：已覆盖路由页面与两套备用盘点页面，并标注重复实现与收敛建议。

