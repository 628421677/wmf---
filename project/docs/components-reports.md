# components（模块 8）统计报表中心（Reports）

本模块对应 `App.tsx` 中业务大厅 -> **统计报表中心**：

- `reports-home` -> `/hall/reports/home`
- `reports-standard` -> `/hall/reports/standard`
- `reports-custom` -> `/hall/reports/custom`
- `reports-logs` -> `/hall/reports/logs`

> 结构特点：
>
>- `ReportsHomePage.tsx` 是模块入口导航页。
>- `ReportsStandardPage.tsx` / `ReportsCustomPage.tsx` / `ReportsLogsPage.tsx` 都是 **wrapper**，统一复用 `ReportCenterEnhanced.tsx` 这个“超级页面”，并通过 `initialTab` 控制默认 tab。
>- `ReportCenter.tsx` 是一个功能简化的旧版实现，当前路由未使用。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## ReportsHomePage.tsx

- **用途**：统计报表中心主页（入口导航）。
- **路由入口**：`reports-home`（`/hall/reports/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: any) => void }`
  - 默认导出 `ReportsHomePage`
- **关键状态 / 数据流**：
  - 3 个快捷入口卡片：
    - 教育部高基表 (`reports-standard`)
    - 自定义报表 (`reports-custom`)
    - 操作日志 (`reports-logs`)
  - 点击卡片调用 `onNavigate` 切换 `currentView`。
- **关键依赖**：`lucide-react`。
- **扩展点**：可根据 `userRole` 控制入口可见性。

## ReportsStandardPage.tsx / ReportsCustomPage.tsx / ReportsLogsPage.tsx

- **用途**：路由 wrapper，将不同路由映射到 `ReportCenterEnhanced.tsx` 的不同 tab。
- **路由入口**：
  - `reports-standard` / `reports-custom` / `reports-logs`
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出组件；内部渲染：
    - `<ReportCenterEnhanced userRole={userRole} initialTab="..." hideTabBar />`
- **关键状态 / 数据流**：无（纯 wrapper）。
- **关键依赖**：`ReportCenterEnhanced`。
- **扩展点**：`ReportsLogsPage` 中包含一个 `useEffect` + `useState` 来解决客户端渲染问题，这表明该组件可能在特定场景下有渲染时序问题，但核心逻辑仍是 wrapper。

---

## ReportCenterEnhanced.tsx（模块核心聚合页）

- **用途**：报表中心“超级页面”，提供标准报表、自定义报表、操作日志三大功能。
- **主要 Props / 导出**：
  - Props：
    - `userRole: UserRole`
    - `initialTab?: 'standard' | 'custom' | 'logs'`（默认 `standard`）
    - `hideTabBar?: boolean`
  - 默认导出 `ReportCenterEnhanced`
- **关键状态 / 数据流**：
  - **数据源（Mock）**：
    - `HIGH_BASE_REPORTS`：高基表列表（含状态/来源/分类）。
    - `HISTORICAL_DATA`：用于历史趋势弹窗的图表数据。
    - `CUSTOM_REPORTS`：自定义报表列表。
    - `REPORT_TEMPLATES`：自定义报表模板库。
    - `OPERATION_LOGS`：操作日志列表。
  - **UI 状态**：
    - `activeTab`：控制 `standard/custom/logs` 三个 tab 的切换。
    - `previewingReport` / `showTrendModal` / `showErrorDetail` / `showTemplates`：控制各类弹窗的显示。
    - `searchKeyword` / `selectedYear` / `selectedCampus` / `selectedCategory`：标准报表 tab 的筛选条件。
    - `selectedReports`：用于批量操作（如批量导出）。
  - **核心功能**：
    - **标准报表**：
      - 列表展示、筛选、批量选择。
      - 操作：预览（`ReportPreviewModal`）、历史趋势（`TrendModal`）、数据异常详情（`ErrorDetailModal`）、导出（Excel/PDF/Word 菜单）。
    - **自定义报表**：
      - 左侧为“我的报表”列表，右侧为“报表设计器”占位 UI。
      - 提供“从模板创建”（`TemplateModal`）入口。
    - **操作日志**：
      - 列表展示、简单筛选与分页占位。
- **关键依赖**：`lucide-react`。
- **扩展点**：
  - 将所有 mock 数据替换为后端接口。
  - 实现自定义报表设计器的拖拽与图表生成逻辑。
  - 完善导出功能（当前仅 UI）。

## ReportCenter.tsx（简化版）

- **用途**：报表中心的简化版实现，只包含“教育部高基表”和“自定义报表”两个 tab。
- **路由入口**：当前未在 `App.tsx` 路由中被使用。
- **关键状态 / 数据流**：
  - 使用独立的 `HIGH_BASE_REPORTS` 和 `CUSTOM_REPORTS` mock 数据。
  - 功能比 `ReportCenterEnhanced.tsx` 少很多，例如没有筛选、批量操作、历史趋势、异常详情等。
- **扩展点**：
  - 属于历史/备用实现，如无特殊需求，可考虑在后续重构中移除，统一使用 `ReportCenterEnhanced`。

---

## 状态

- **模块 8 初版已完成**：已覆盖报表中心相关组件，并指出了 `ReportCenterEnhanced` 与 `ReportCenter` 的主次关系。

