# components（模块 4）校内公用房使用收费管理（Fee）

本模块对应 `App.tsx` 中业务大厅 -> **校内公用房使用收费管理**：

- `fees-home` -> `/hall/fees/home`
- `fees-overview` -> `/hall/fees/overview`
- `fees-persons` -> `/hall/fees/persons`
- `fees-bills` -> `/hall/fees/bills`
- `fees-payments` -> `/hall/fees/payments`
- `fees-reminders` -> `/hall/fees/reminders`（资产管理员可见）

> 结构特点：
>
>- `FeeManagementHome.tsx` 是模块入口。
>- 其余 `FeeManagementOverview/Persons/Bills/Payments/Reminders.tsx` 多为 **wrapper**，统一复用 `FeeManagement.tsx` 这个“超级页面”。
>- `FeeManagement.tsx` 内含：年度收费总览、个人缴费、账单、缴费、催缴、黑名单、以及 Gemini AI 分析报告。

统一说明字段：

- **用途**
- **路由入口**
- **主要 Props / 导出**
- **关键状态 / 数据流**
- **关键依赖**
- **扩展点**

---

## FeeManagementHome.tsx

- **用途**：收费管理模块主页（入口导航）。
- **路由入口**：`fees-home`（`/hall/fees/home`）。
- **主要 Props / 导出**：
  - Props：`{ onNavigate: (view: View) => void; userRole: UserRole }`
  - 默认导出 `FeeManagementHome`
- **关键状态 / 数据流**：
  - `isAssetAdmin = userRole === UserRole.AssetAdmin`
  - `modules` 定义 5 个入口卡片，其中 `fees-reminders` 仅资产管理员可见。
  - 点击卡片通过 `onNavigate(mod.id)` 切换 `currentView`。
- **关键依赖**：`View`（`App.tsx`）、`UserRole`（types）、`lucide-react`。
- **扩展点**：
  - 将入口与权限从后端下发（菜单配置）。
  - 在入口页展示“本年度待确认账单数量”等概览。

## FeeManagementOverview.tsx / FeeManagementPersons.tsx / FeeManagementBills.tsx / FeeManagementPayments.tsx / FeeManagementReminders.tsx

- **用途**：收费模块子页面的路由 wrapper；通过 props 决定 `FeeManagement.tsx` 的默认 tab。
- **路由入口**：
  - `fees-overview` / `fees-persons` / `fees-bills` / `fees-payments` / `fees-reminders`
- **主要 Props / 导出**：
  - Props：`{ userRole: UserRole }`
  - 默认导出组件，内部渲染：
    - `<FeeManagement userRole={userRole} initialTab="..." hideTabNav />`
- **关键状态 / 数据流**：无。
- **关键依赖**：`FeeManagement`。
- **扩展点**：
  - 如果后续将 `FeeManagement.tsx` 拆分为多页面，这里可以逐步替换为独立实现。

---

## FeeManagement.tsx（模块核心聚合页）

- **用途**：收费管理“超级页面”，覆盖：
  - 年度收费总览（按学院/部门）
  - 个人缴费（人员维度）
  - 学院账单（B 单）管理
  - 缴费记录
  - 催缴管理（资产管理员）
  - 黑名单冻结提示（学院/教师端）
  - AI 智能分析报告（Gemini）
  - 批量生成账单（按月生成个人账单并汇总学院总账单）

- **路由入口**：
  - 在各 wrapper 页面里使用 `hideTabNav`，因此每个路由只展示一个子 tab。
  - 若直接用 `<FeeManagement />` 且 `hideTabNav=false`，则内部有 tab 导航。

- **主要 Props / 导出**：
  - Props：
    - `userRole: UserRole`
    - `initialTab?: 'overview' | 'persons' | 'bills' | 'payments' | 'reminders'`（默认 overview）
    - `hideTabNav?: boolean`（默认 false）
  - 默认导出 `FeeManagement`

- **关键状态 / 数据流**：
  - **本文件内部实现了一个简化版 `useLocalStorage`**（直接操作 `window.localStorage`），与项目通用 `../hooks/useLocalStorage` 不同。
  - 核心数据（localStorage keys）：
    - `extended-fees`：`ExtendedDepartmentFee[]`（学院/部门年度费用聚合）
    - `fee-bills`：`FeeBill[]`（学院总账单 B）
    - `payment-records`：`PaymentRecord[]`
    - `reminder-records`：`ReminderRecord[]`
    - `person-usages-v1`：`PersonUsage[]`（人员用房面积/价格等）
    - `person-fee-bills-v1`：`PersonFeeBill[]`（个人账单）
  - Mock 初始值来源：
    - `MOCK_EXTENDED_FEES` / `MOCK_FEE_BILLS` / `MOCK_PAYMENT_RECORDS` / `MOCK_REMINDER_RECORDS`
    - `MOCK_PERSON_USAGES`（`constants/personFeeData.ts`）
  - 角色与数据可见性：
    - `myDepartmentName`：根据 role 映射（学院管理员=机械工程学院，教师=计算机学院，资产管理员=资产处）。
    - `isAssetAdmin`：资产管理员可看全部部门，其他角色仅看本部门。
    - 非资产管理员若本部门 `isBlacklisted`：展示“用房申请权限已被冻结”。
  - 统计聚合：`stats`（按 `yearFilter` 汇总部门数、应收/已收/待收、待处理账单数、黑名单数、超额数等）。
  - 筛选：`filteredFees` 支持 `searchTerm/statusFilter/yearFilter`，并叠加“非资产管理员只看本部门”。

  ### 关键业务动作

  - **AI 分析**：`handleGenerateReport()`
    - 调用 `generateFeeAnalysisReport(fees)`（`services/geminiService`）
    - 结果用 `ReactMarkdown` 渲染。

  - **发送催缴**：`handleSendReminder(fee, type)`
    - 生成 `ReminderRecord`（System/OA/SMS/Email 文案）写入 `reminder-records`。
    - 同时更新部门费用：`hasReminder/reminderCount/lastReminderAt`。

  - **学院确认账单**：`handleConfirmBill(fee)`
    - 将部门 `ExtendedDepartmentFee.status` 与对应 `FeeBill.status` 推进到 `FinanceProcessing`。

  - **财务扣款完成**：`handleFinanceDeduction(fee)`
    - 生成 `PaymentRecord`（paymentMethod=`FinanceDeduction`，status=`Confirmed`）写入。
    - 将费用推进到 `Completed`，并置 `paidAmount=totalCost/remainingAmount=0`。

  - **黑名单**：`handleAddToBlacklist/handleRemoveFromBlacklist`
    - 将 `ExtendedDepartmentFee.isBlacklisted` 切换。

  - **批量生成账单（按月）**：`handleGenerateBills(month)`
    - 生成个人账单 `PersonFeeBill[]`：
      - `quotaArea = getPersonQuotaArea(title)`（utils/personQuota）
      - `excessArea = max(0, actualArea - quotaArea)`
      - `baseCost = excessArea * basePrice`
      - `tierMultiplier = excessArea > 0 ? 1.5 : 1.0`（当前为简化规则）
      - `amount = baseCost + tierCost`
      - 过滤 `amount > 0` 才生成。
    - 汇总学院总账单 `FeeBill[]`（按 department 聚合个人账单），并生成 `ExtendedDepartmentFee[]`。
    - 写入策略：按 month 覆盖（先过滤掉相同 month 再追加），避免重复生成。

  - **导出**：`handleExport('fees'|'payments')`
    - 生成 CSV 并用 Blob 下载（含 `\ufeff` 防乱码）。
    - 当前不导出 bills（type='bills' 未实现）。

- **关键依赖**：
  - `recharts`（柱状图/饼图）
  - `react-markdown`
  - `services/geminiService`（Gemini AI 分析）
  - `PersonFeeManagement`（个人缴费 tab 内部实现）
  - `utils/personQuota`（按职称算定额面积）
  - `constants` 各种 MOCK 数据

- **扩展点**：
  - 建议统一全项目 `useLocalStorage` 实现（当前 FeeManagement/CommercialHousingEnhanced 各自有一份实现）。
  - 账单生成规则（tierMultiplier）应从 `RuleEngine` 或后端策略服务读取。
  - `myDepartmentName` 当前为硬编码映射，真实场景应来自登录态（用户组织信息）。
  - `FeeBill/ExtendedDepartmentFee/PersonFeeBill` 的 month/year 字段使用混合（部分为 any），建议统一类型并避免 `(as any).month`。
  - “导出”建议使用 `xlsx`（项目已依赖）或后端导出任务。

---

## 状态

- **模块 4 初版已完成**：已覆盖 Fee 相关组件与核心数据流。

如你要继续进入模块 5（调配 HousingAllocation）我可以接着做。
