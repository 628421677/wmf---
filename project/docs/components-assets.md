# components（模块 1）资产转固与管理（Assets）

本模块对应 `App.tsx` 中业务大厅 -> **资产转固与管理**，核心路由：

- `assets-home` -> `/hall/assets/home`
- `assets-project-new` -> `/hall/assets/project-new`
- `assets-stock-import` -> `/hall/assets/stock-import`
- `assets-apply` -> `/hall/assets/apply`
- `assets-review` -> `/hall/assets/review`
- `assets-gaojibiao` -> `/hall/assets/gaojibiao`
- `assets-room-functions` -> `/hall/assets/room-functions`
- `assets-audit-log` -> `/hall/assets/audit-log`

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## AssetsHomePage.tsx

- **用途**：资产转固与管理模块主页（入口 + 关键统计）。
- **路由入口**：`assets-home`（`/hall/assets/home`）。
- **主要 Props / 导出**：
  - 默认导出 `AssetsHomePage`
  - Props：`{ onNavigate: (view: any) => void }`（实际传入的是 `setCurrentView`）。
- **关键状态 / 数据流**：
  - 通过 `useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS)` 读取项目库（本地持久化 + Mock 初始化）。
  - `useMemo(stats)` 统计：
    - 使用 `normalizeAssetStatus((p as any).status)` 兼容旧状态字段。
    - `pending`：`PendingReview` 数量
    - `constructionAmount`：非 `Archived` 项目 `contractAmount` 汇总
    - `completed`：`Archived` 数量
    - `overdue`：`isOverdue` 数量
  - UI：
    - `StatCard` 展示统计。
    - `ShortcutCard` 将用户导航到各子功能（调用 `onNavigate('assets-xxx')`）。
- **关键依赖**：
  - `useLocalStorage`（hooks）
  - `MOCK_PROJECTS`、`AssetStatus`、`Project`
  - `normalizeAssetStatus`（utils/legacyAssetStatus）
  - `lucide-react`
- **扩展点**：
  - 将 `projects` 由 localStorage/Mock 替换为后端接口（建议沉淀到 `services/projects`）。
  - 统计口径可与驾驶舱、报表中心统一。

## AssetsProjectNewPage.tsx

- **用途**：新建工程项目页面，录入基建/修缮项目。
- **路由入口**：`assets-project-new`（`/hall/assets/project-new`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `AssetsProjectNewPage`
- **关键状态 / 数据流**：
  - `useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS)`：获取/写入项目列表。
  - `useLocalStorage<AuditLog[]>('uniassets-audit-logs', [])`：写入审计日志。
  - `logAudit(...)`：
    - 生成 `AuditLog`（含 `action/entityType/entityId/entityName/operatorRole/timestamp`）。
    - 追加到日志列表头部，并截断到 1000 条。
  - 渲染 `ProjectForm`：
    - `mode="create"`
    - `existingProjectCount={projects.length}`
    - `onSubmit(newProject)`：写入 `projects` + `logAudit('create','project',...)`
    - `onCancel`：目前不跳转（路由由 `App.tsx` 的 `currentView` 管控）。
- **关键依赖**：
  - `ProjectForm`（components）
  - `useLocalStorage`、`MOCK_PROJECTS`
  - `AuditLog/Project/UserRole` types
- **扩展点**：
  - `ProjectForm` 提交改为调用后端创建接口并返回 id。
  - 审计日志统一改为服务端（前端仅展示）。

## AssetsApplyPage.tsx

- **用途**：转固申请页：查看项目、维护资产拆分与附件，满足条件后将项目推进到“待审核”。
- **路由入口**：`assets-apply`（`/hall/assets/apply`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`（当前文件本身未直接使用 `userRole` 做权限分支，但会传给日志/后续扩展）。
  - 默认导出 `AssetsApplyPage`
- **关键状态 / 数据流**：
  - 数据源：`useAssetData()` 返回 `{ projects, setProjects }`（集中管理资产项目 + 审计）。
  - 权限/可编辑判断：
    - `isEditable(p)`：仅 `p.status === AssetStatus.DisposalPending`（待处置）可编辑拆分/附件。
    - `canOnlyViewProgress(p)`：`PendingReview/PendingArchive/Archived` 仅查看进度。
  - 列表筛选：`searchTerm` + `useMemo(filtered)`（匹配 name/id/contractor）。
  - 发起转固申请按钮：
    - 仅待处置可点。
    - 使用 `computeAttachmentCompletion(AssetStatus.PendingReview, p.attachments)` 校验必备附件是否齐全。
    - 通过后 `setProjects` 将状态置为 `PendingReview`。
  - 详情弹窗：`selectedProject` + `detailTab`：
    - `flow`：流程节点展示（待处置/待审核/待归档/已归档）。
    - `split`：资产拆分：
      - `splitForm`（类别、折旧方法、年限…）
      - 新增拆分项生成 `AssetSplitItem` 并写回项目。
      - 删除拆分项：过滤 `splitItems`。
    - `attachments`：附件清单 + 模拟上传：
      - `getStageAttachmentRequirements(PendingReview)` 获取必备/选填清单。
      - `computeAttachmentCompletion` 给出完成度与缺失项。
      - 上传为模拟：读取 DOM input/select，构造 `ProjectAttachment` 并写回（reviewStatus=Pending）。
      - 对驳回附件支持“重新上传/编辑/删除”（均重置 reviewStatus=Pending）。
      - 下载为模拟：生成 txt Blob。
- **关键依赖**：
  - `useAssetData`（hooks）
  - `types`：`Project/AssetStatus/AssetCategory/AssetSplitItem/ProjectAttachment` 等
  - `utils/assetStatus`（状态标签与颜色）
  - `utils/assetAttachmentRequirements`（阶段附件要求 + 完成度计算）
  - `lucide-react`
- **扩展点**：
  - “上传附件”应替换为真实上传（返回 URL/文件 id），并去掉 DOM 读值，改为受控表单。
  - 将项目状态流转放到后端（前端只发起动作、刷新状态）。
  - 附件审核意见与流程节点应统一到 `AssetsReviewPage` / `ProcessCenter`。

## AssetsReviewPage.tsx

- **用途**：转固审核页：仅展示“待审核”项目，对附件逐个或批量审核；必备附件全部通过后推进到“待归档”。
- **路由入口**：`assets-review`（`/hall/assets/review`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `AssetsReviewPage`
- **关键状态 / 数据流**：
  - 数据源：`useAssetData()` 返回 `{ projects, setProjects, logAudit }`。
  - 列表：`filtered` 仅保留 `p.status === AssetStatus.PendingReview`，并按关键字筛选。
  - 弹窗：`selectedProjectId` -> `selectedProject`。
  - `pendingAttachments`：统计当前项目 `reviewStatus===Pending` 的附件。
  - `updateProjectAttachments(project, updater)`：
    - 规范化旧附件 `reviewStatus`（默认 Pending）。
    - 计算 `computeAttachmentCompletion(PendingReview, newAttachments)`。
    - 若必备附件全部 Approved：自动将项目状态从 `PendingReview` 推进到 `PendingArchive` 并写审计日志（`status_change`）。
    - 更新 `projects` 中对应项目的 attachments/status。
    - 若推进成功则关闭弹窗（项目会从列表消失）。
  - `approveAllPending(project)`：将所有 Pending 附件批量置为 Approved + 写审计日志。
  - `reviewOne(project, attachmentId, status)`：单附件通过/驳回 + 写审计日志。
  - `handleDownload`：附件下载为模拟 txt。
  - 页面底部提供“进入待归档”按钮：
    - 仅当必备附件通过数 == 必备总数 且 总数>0 时可用。
    - 点击后强制把项目状态置为 `PendingArchive` 并写审计日志。
- **关键依赖**：
  - `useAssetData`
  - `utils/assetStatus`、`utils/assetAttachmentRequirements`
  - `lucide-react`
- **扩展点**：
  - 附件审核应由后端保存审核人/时间/意见，前端改为调用 `services/assetReview`。
  - “手动进入待归档”建议后端校验（避免越权/状态穿透）。

## AssetsAuditLogPage.tsx

- **用途**：资产模块审计日志查看页（操作记录）。
- **路由入口**：`assets-audit-log`（`/hall/assets/audit-log`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`（当前实现未直接使用 `userRole` 做 UI 分支）。
  - 默认导出 `AssetsAuditLogPage`
- **关键状态 / 数据流**：
  - 数据来源：
    - `useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS)`：用来构造项目下拉筛选的候选项。
    - `useLocalStorage<AuditLog[]>('uniassets-audit-logs', [])`：日志数据本体。
  - 筛选状态：`searchTerm`、`projectFilter`、`startDate`、`endDate`。
  - `projectOptions`：
    - 合并 `projects` 与 `auditLogs` 中 `entityType==='project'` 的项目候选。
    - 使用 `Map` 去重（key=项目 id）。
  - `filteredLogs`：
    - 过滤项目（仅 project 类型且 id 匹配）。
    - 过滤时间范围（将 yyyy-mm-dd 转为当天 00:00:00 与 23:59:59.999 的毫秒区间）。
    - 关键字搜索：`entityName/entityId/operator/actionLabel`。
    - 最终按 `timestamp` 倒序。
  - 展示：
    - 日志行包含：实体名、动作标签、时间、操作者(角色)。
    - 若 `changedFields` 存在：逐字段展示 old/new（使用 `getFieldLabel` 做中文字段名映射）。
- **关键依赖**：
  - `useLocalStorage`
  - `MOCK_PROJECTS`
  - `AuditLog/Project/UserRole` types
  - `lucide-react`
- **扩展点**：
  - 将 `formatDate` 显示统一为 `zh-CN` 与固定时区策略。
  - `changedFields` 的 old/new 对于对象当前是 `String(...)`，可增强为 JSON 格式化。
  - 接入服务端日志分页与导出。

## AssetsStockImportPage.tsx

- **用途**：存量房产导入（Excel），支持导入“楼宇台账”和“房间台账”，导入策略为“仅新增，重复跳过”，并落库到本地存储。
- **路由入口**：`assets-stock-import`（`/hall/assets/stock-import`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `AssetsStockImportPage`
- **关键状态 / 数据流**：
  - 本文件把“存量房产”拆成两个 tab：
    - `buildings`（楼宇导入）
    - `rooms`（房间导入）
  - 使用 `xlsx` 读取文件：
    - `handleFile(file)`：`file.arrayBuffer()` -> `XLSX.read(...)` -> `sheet_to_json`。
    - 保存首个 sheet 的 rows 到 `rawRows`，并调用 `parseCurrentSheet`。
    - 目前 `handleChangeSheet` 仅更新 state，但无法重新解析其它 sheet（因为 workbook 没有存到 state）。
  - `parseCurrentSheet(rows)`：
    - `normalizeHeader` 将表头规整为小写去空格。
    - 支持中英表头别名映射：`bAlias`（BuildingRow）、`rAlias`（RoomRow）。
    - 对每行做必填校验、日期/数字解析，并生成 `errors: RowError[]`。
    - 在文件内做重复校验（楼宇按 code，房间按 `${buildingCode||buildingName}::${roomNo}`）。
  - `doImport()`：
    - `canImport`：必须 `errors.length===0` 且行数>0。
    - 楼宇：
      - 读取 `getStoredBuildings()`（localStorage，key=`BUILDINGS_STORAGE_KEY`）。
      - 按 `code` 去重，只新增不存在的。
      - 生成落库对象 `id=BLD-${code}`，并写入 `setStoredBuildings([...toAdd, ...existing])`。
    - 房间：
      - 读取 `getStoredRooms()`（key=`ROOMS_STORAGE_KEY`）。
      - 按 `${buildingName}::${roomNo}` 去重，只新增不存在的。
      - 生成落库对象 `id=RM-IMPORT-${buildingName}-${roomNo}`，并写入 `setStoredRooms([...toAdd, ...existing])`。
    - 审计：
      - `buildAuditLog(...)` 生成导入批次日志（entityType 用的是 `project`，entityName 标记为“存量房产导入-楼宇/房间”）。
      - 追加到 `uniassets-audit-logs`，最多 1000 条。
    - `setProjects(prev=>prev)` 是 no-op，用于“触发 hook”避免 unused。
  - UI：
    - 提供模板表头提示（中英文）。
    - 预览表格展示前 50 行。
- **关键依赖**：
  - `xlsx`
  - `useLocalStorage`
  - `utils/assetDigitalSync`（楼宇台账存储）
  - `utils/assetRoomSync`（房间台账存储）
  - `lucide-react`
- **扩展点**：
  - 支持选择并解析任意 sheet：把 workbook 存入 state，或在 `handleFile` 时缓存所有 sheet 的 rows。
  - 支持覆盖更新（当前仅新增）。
  - 将导入做成后端异步任务（大文件/断点/错误行回传）。

## AssetsGaojibiaoPage.tsx

- **用途**：高基表映射维护页：对“待归档/已归档”项目维护 `gaojibiaoData` 字段映射。
- **路由入口**：`assets-gaojibiao`（`/hall/assets/gaojibiao`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `AssetsGaojibiaoPage`
- **关键状态 / 数据流**：
  - 数据源：`useAssetData()` 返回 `{ projects, setProjects, logAudit }`。
  - 列表：只展示 `PendingArchive/Archived` 的项目，并支持 `searchTerm` 过滤。
  - 弹窗：`selectedProject`。
  - `isEditable`：仅当项目状态为 `PendingArchive` 或 `Archived` 才允许编辑（否则只读）。
  - 表单：`gaojibiaoForm: GaojibiaoMapping`：
    - 通过 `useEffect` 在选中项目时从 `(selectedProject as any).gaojibiaoData` 初始化。
    - 字段包括：`assetCode/assetName/department/serviceLife/originalValue/residualRate`。
  - 保存：`handleSaveGaojibiao()`：
    - 将 `gaojibiaoForm` 写回项目的 `gaojibiaoData`。
    - `setProjects` 更新列表。
    - `logAudit('update','project',..., { gaojibiaoData: { old:'...', new:'updated' }})`。
- **关键依赖**：
  - `useAssetData`
  - `types`：`GaojibiaoMapping/Project/AssetStatus/UserRole`
  - `lucide-react`
- **扩展点**：
  - 把 `old:'...'` 替换为真实 diff（对比旧/新字段）。
  - 映射字段可做成配置化 schema（不同资产类别不同字段）。
  - 将映射结果与 `ReportsStandardPage` 生成高基表联动。

## AssetsRoomFunctionsPage.tsx

- **用途**：房间功能划分页：对“待归档/已归档”项目维护 `roomFunctionPlan`（房间 -> 主类/亚类/面积等），并可确认后同步到全局房间台账。
- **路由入口**：`assets-room-functions`（`/hall/assets/room-functions`）。
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出 `AssetsRoomFunctionsPage`
- **关键状态 / 数据流**：
  - 数据源：`useAssetData()` 返回 `{ projects, setProjects, logAudit }`。
  - 列表：只展示 `PendingArchive/Archived` 项目；支持 `searchTerm`。
  - 弹窗：`selectedProject`。
  - `isEditable`：`PendingArchive/Archived` 可编辑，否则只读。
  - `handleUpdateProject(updatedProject)`：
    - 更新项目列表。
    - 写审计日志 `roomFunctionPlan: { old:'...', new: updatedProject.roomFunctionPlan || [] }`。
  - 使用 `RoomFunctionPlanTab` 完成编辑：
    - `plan={selectedProject.roomFunctionPlan || []}`
    - `onChange(next)`：写回项目并刷新弹窗内数据。
    - `confirmed/confirmedAt/confirmedBy`：使用项目上的 `roomFunctionPlanConfirmed*` 字段。
    - `onConfirm()`：
      - 若只读则退出。
      - 根据项目名称自动填充缺失 `subCategory`：
        - 名称含 `c5` 或 `和园` -> `StudentDorm`
        - 名称含 `教师公寓` -> `StaffTurnover`
      - 写回 `roomFunctionPlanConfirmed=true` 及确认时间/人。
      - 调用 `upsertRoomsFromProject(updated)` 同步到全局房间台账（localStorage: `uniassets-rooms-v1`）。
      - 同步成功/失败给出提示（失败会 `console.error`）。
    - `floorCount={Number(selectedProject.floorCount || 0)}` 用于新增房间时的楼层下拉。
  - `asInfrastructureDept`：UI 上提供“以基建处身份”的 checkbox，目前未参与权限逻辑（预留）。
- **关键依赖**：
  - `useAssetData`
  - `RoomFunctionPlanTab`
  - `utils/assetRoomSync`：`upsertRoomsFromProject`
  - `lucide-react`
- **扩展点**：
  - `asInfrastructureDept` 应参与权限/可编辑策略（例如基建处只能维护部分字段）。
  - `upsertRoomsFromProject` 同步逻辑建议服务端化，避免多端不一致。
  - 确认动作应校验：是否所有房间都已选择主类/亚类（当前未强制）。

## RoomFunctionPlanTab.tsx（AssetsRoomFunctionsPage 的关键子组件）

- **用途**：房间功能划分的编辑表格组件（新增房间、维护主类/亚类/备注、确认划分）。
- **路由入口**：非路由组件；由 `AssetsRoomFunctionsPage` 弹窗内引用。
- **主要 Props / 导出**：
  - Props：
    - `projectName`：用于默认建筑名称
    - `plan`：`RoomFunctionPlanItem[]`
    - `onChange(next)`：父组件持久化
    - `confirmed/confirmedAt/confirmedBy`：展示确认状态
    - `onConfirm()`：由父组件实现同步逻辑
    - `disabled?`：控制是否可编辑
    - `userRole`：当前仅传入，未做 UI 分支（预留）
    - `floorCount?`：生成楼层下拉
  - 默认导出 `RoomFunctionPlanTab`
- **关键状态 / 数据流**：
  - `mains = getMainCategories()`：主类枚举来自 `utils/roomFunctionCatalog`。
  - `newRow`：新增房间的临时输入（建筑/楼层/房间号/面积）。
    - 默认建筑名称取 `plan[0]?.buildingName || projectName`。
  - `addRow()`：
    - 校验必填（建筑/楼层/房间号/面积>0）。
    - 生成 `RoomFunctionPlanItem`：
      - `id = RFP-${Date.now()}-${random}`
      - `roomNo = ${floor}-${roomNoRaw}`
      - `mainCategory/subCategory` 初始为空
    - `onChange([item, ...plan])` 头插。
  - `updateRow(id, patch)`：对 plan 做 map 更新。
  - 主类 select：变更时会自动将亚类设为该主类的第一个子类（`getSubCategories(main)[0]`）。
  - `removeRow(id)`：二次确认后删除。
- **关键依赖**：
  - `utils/roomFunctionCatalog`：`getMainCategories/getSubCategories`
  - `lucide-react`
- **扩展点**：
  - 增加“重复房间号/建筑+房间号”校验。
  - 增加面积合计与和项目总面积对账。
  - 将 `roomNo` 字段拆分为楼层与房间号分别存储，避免字符串解析。

---

## 待补全（该模块范围内暂无）

该模块下 `Assets*.tsx` 已补齐到源码级说明。后续会继续补齐与资产模块强相关但不以 `Assets` 前缀命名的文件：

- `AssetTransfer.tsx`
- `ProjectForm.tsx`
- `BidModals.tsx`
- `ContractModals.tsx`
