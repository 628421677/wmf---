// Domain Types

export enum UserRole {
  Teacher = 'Teacher',             // 教师
  CollegeAdmin = 'CollegeAdmin',   // 二级学院管理员
  AssetAdmin = 'AssetAdmin',       // 资产处管理员
  Guest = 'Guest'                  // 游客
}

export enum AssetStatus {
  Initiation = 'Initiation',       // 立项阶段
  Construction = 'Construction',   // 建设实施阶段
  FinalAccounting = 'FinalAccounting', // 竣工决算阶段
  InventoryCheck = 'InventoryCheck',   // 资产清查阶段
  TransferIn = 'TransferIn',       // 转固入账阶段
  Archive = 'Archive',             // 档案归档阶段
  Disposal = 'Disposal'            // 处置
}

export enum AllocationStatus {
  Draft = 'Draft',
  PendingLevel1 = 'PendingLevel1', // Vice President
  PendingLevel2 = 'PendingLevel2', // Leadership Group
  PendingLevel3 = 'PendingLevel3', // Chancellor Meeting
  Approved = 'Approved',
  Rejected = 'Rejected',
  Allocated = 'Allocated',         // 已配房
  Completed = 'Completed'          // 已完成
}

export enum FeeStatus {
  Verifying = 'Verifying',       // 数据核对中
  BillGenerated = 'BillGenerated', // 账单已生成
  PendingConfirm = 'PendingConfirm', // 待学院确认
  Disputed = 'Disputed',         // 争议中
  FinanceProcessing = 'FinanceProcessing', // 财务扣款中
  Completed = 'Completed'        // 已完结
}

// ========== 收费管理扩展类型 ==========

// 收费标准配置
export interface FeeStandard {
  id: string;
  name: string;                  // 标准名称
  useType: RoomUseType;          // 适用房间类型
  basePrice: number;             // 基础单价 (元/m²/年)
  effectiveDate: string;         // 生效日期
  expiryDate?: string;           // 失效日期
  isActive: boolean;
  description?: string;
}

// 阶梯收费规则
export interface FeeTierRule {
  id: string;
  standardId: string;            // 关联收费标准
  minExcessPercent: number;      // 最小超额比例 (%)
  maxExcessPercent: number | null; // 最大超额比例，null表示无上限
  multiplier: number;            // 费率倍数
  description: string;
}

// 账单
export interface FeeBillItem {
  code: string;
  name: string;
  amount: number;
  unit: string;
}

export interface FeeBill {
  id: string;
  billNo: string;                // 账单编号
  year: number;                  // 账单年度
  month?: string;                // 账期月份（按月）
  departmentId: string;
  departmentName: string;
  quotaArea: number;             // 定额面积
  actualArea: number;            // 实际占用面积
  excessArea: number;            // 超额面积
  basePrice: number;             // 适用单价
  tierMultiplier: number;        // 阶梯倍率
  calculatedAmount: number;      // 计算金额
  items?: FeeBillItem[];         // 拆项明细
  adjustedAmount?: number;       // 调整后金额
  adjustReason?: string;         // 调整原因
  status: FeeStatus;
  generatedAt: string;           // 生成时间
  confirmedAt?: string;          // 确认时间
  paidAt?: string;               // 缴费时间
  operator: string;              // 操作人
  remarks?: string;
}

// 缴费记录
export interface PaymentRecord {
  id: string;
  billId: string;
  billNo: string;
  departmentName: string;
  personId?: string;
  personName?: string;
  amount: number;
  paymentMethod: 'BankTransfer' | 'FinanceDeduction' | 'Cash' | 'Other';
  paymentDate: string;
  transactionNo?: string;        // 交易流水号
  voucherUrl?: string;           // 凭证附件
  operator: string;
  confirmedBy?: string;          // 财务确认人
  confirmedAt?: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  remarks?: string;
}

// 催缴记录
export interface ReminderRecord {
  id: string;
  billId: string;
  billNo: string;
  departmentName: string;
  personId?: string;
  personName?: string;
  reminderType: 'System' | 'SMS' | 'Email' | 'OA' | 'Phone';
  content: string;
  sentAt: string;
  sentBy: string;
  isRead: boolean;
  readAt?: string;
  response?: string;             // 回复内容
  responseAt?: string;
}

// 数据核对记录
export interface VerificationRecord {
  id: string;
  billId: string;
  departmentName: string;
  verifyType: 'AreaCheck' | 'QuotaCheck' | 'PriceCheck';
  originalValue: number;
  reportedValue: number;
  finalValue: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// 争议记录
export interface DisputeRecord {
  id: string;
  billId: string;
  billNo: string;
  departmentName: string;
  disputeType: 'AreaDispute' | 'PriceDispute' | 'QuotaDispute' | 'Other';
  description: string;
  evidence?: string[];           // 证据附件
  status: 'Open' | 'UnderReview' | 'Resolved' | 'Rejected';
  submittedBy: string;
  submittedAt: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// ========== 个人收费管理扩展类型 ==========

// 扩展的个人费用信息
export interface ExtendedPersonFee {
  id: string;
  personId: string;
  personName: string;
  title: string; // 职称
  departmentName: string;
  year: number;
  quotaArea: number;
  actualArea: number;
  excessArea: number;
  excessPercent: number;
  basePrice: number;
  tierMultiplier: number;
  totalCost: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeStatus;
  isPaid: boolean;
  hasReminder: boolean;
  reminderCount: number;
  lastReminderAt?: string;
}

// 个人账单 (学院总账单的分项)
export interface PersonFeeBill {
  id: string;
  collegeBillId: string; // 关联的学院总账单ID
  personId: string;
  personName: string;
  departmentName: string;
  year: number;
  month?: string; // 账期月份（按月）
  quotaArea: number;
  actualArea: number;
  excessArea: number;
  basePrice?: number;
  tierMultiplier?: number;
  baseCost?: number;
  tierCost?: number;
  amount: number;
  status: FeeStatus;
  generatedAt: string;
}

// 扩展的部门费用信息
export interface ExtendedDepartmentFee {
  id: string;
  departmentName: string;
  year: number;
  quotaArea: number;
  actualArea: number;
  excessArea: number;
  excessPercent: number;         // 超额比例
  basePrice: number;
  tierMultiplier: number;
  baseCost: number;              // 基础费用
  tierCost: number;              // 阶梯加收
  totalCost: number;             // 总费用
  excessCost: number;            // 向后兼容字段，等同于 totalCost
  paidAmount: number;            // 已缴金额
  remainingAmount: number;       // 待缴金额
  status: FeeStatus;
  isPaid: boolean;
  hasReminder: boolean;
  reminderCount: number;         // 催缴次数
  lastReminderAt?: string;
  confirmedAt?: string;
  paidAt?: string;
  isBlacklisted: boolean;        // 是否黑名单
}

// 工程进度节点
export enum ProjectMilestone {
  Approval = 'Approval',           // 立项批复
  Bidding = 'Bidding',             // 招标完成
  Construction = 'Construction',   // 开工建设
  MainComplete = 'MainComplete',   // 主体完工
  Completion = 'Completion',       // 竣工验收
  Audit = 'Audit',                 // 审计决算
  Transfer = 'Transfer'            // 转固入账
}

// 资金来源
export enum FundSource {
  Fiscal = 'Fiscal',               // 财政拨款
  SelfRaised = 'SelfRaised',       // 自筹资金
  Mixed = 'Mixed'                  // 混合来源
}

// 资产分类（用于拆分）
export enum AssetCategory {
  Building = 'Building',           // 房屋建筑物
  Land = 'Land',                   // 土地
  Structure = 'Structure',         // 构筑物
  Equipment = 'Equipment',         // 设备
  Greening = 'Greening',           // 绿化
  Other = 'Other'                  // 其他
}

// 工程进度记录
export interface MilestoneRecord {
  milestone: ProjectMilestone;
  date: string;
  operator: string;
  notes?: string;
}

// 工程附件
export type AttachmentReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ProjectAttachment {
  id: string;
  name: string;
  type: 'approval' | 'bidding' | 'contract' | 'change' | 'drawing' | 'acceptance' | 'audit' | 'other';
  uploadDate: string;
  fileUrl?: string;

  // 审核信息（附件由其他部门上传，资产管理员审核）
  reviewStatus?: AttachmentReviewStatus; // 默认 Pending
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  uploadedByDept?: string;
}

// 资产拆分项
export interface AssetSplitItem {
  id: string;
  category: AssetCategory;
  name: string;
  amount: number;
  area?: number;              // 建筑面积（房屋类）
  quantity?: number;          // 数量（设备类）
  depreciationYears: number;  // 折旧年限
  depreciationMethod: 'StraightLine' | 'Accelerated'; // 折旧方式
  assetCardNo?: string;       // 生成的资产卡片号
}

// 高基表映射字段
export interface GaojibiaoMapping {
  buildingArea?: number;      // 建筑面积
  structureType?: string;     // 结构类型
  floorCount?: number;        // 层数
  useYears?: number;          // 使用年限
  landArea?: number;          // 占地面积
  greenArea?: number;         // 绿化面积

  // 兼容 AssetTransfer.tsx 中“高基表字段映射”表单
  assetCode?: string;
  assetName?: string;
  department?: string;
  serviceLife?: number;
  originalValue?: number;
  residualRate?: number;
}

// 房间功能划分
export interface RoomFunctionPlanItem {
  id: string;
  buildingName: string;
  roomNo: string;
  area: number;
  mainCategory: string;
  subCategory: string;
  remark?: string;
}

export interface Project {
  id: string;
  name: string;
  contractAmount: number;
  finalAmount?: number;       // 决算金额
  auditAmount?: number;       // 审计金额
  auditReductionRate?: number; // 审减率
  contractor: string;
  status: AssetStatus;
  completionDate: string;
  hasCadData: boolean;
  isTempCardCreated?: boolean;
  isArchived?: boolean;          // 是否归档
  
  // 核心字段
  fundSource: FundSource;           // 资金来源
  location?: string;                // 建设地点
  plannedArea?: number;             // 规划建筑面积
  plannedStartDate?: string;        // 计划开工日期
  plannedEndDate?: string;          // 计划竣工日期
  actualStartDate?: string;         // 实际开工日期
  actualEndDate?: string;           // 实际竣工日期
  projectManager?: string;          // 项目负责人
  supervisor?: string;              // 监理单位
  floorCount?: number;              // 楼层
  roomCount?: number;               // 房间数

  // 地图选址与土地资源
  landParcelId?: string; // 关联土地资源ID
  locationPoint?: { lat: number; lng: number }; // 地图坐标

  // 房间功能划分 (归档前)
  roomFunctionPlan?: RoomFunctionPlanItem[];
  roomFunctionPlanConfirmed?: boolean;
  roomFunctionPlanConfirmedAt?: string;
  roomFunctionPlanConfirmedBy?: string;
  
  milestones?: MilestoneRecord[];   // 进度节点记录
  attachments?: ProjectAttachment[]; // 附件列表
  splitItems?: AssetSplitItem[];    // 资产拆分项
  gaojibiaoData?: GaojibiaoMapping; // 高基表数据
  
  isOverdue?: boolean;              // 是否超期
  overduedays?: number;             // 超期天数
}

export interface RoomRequest {
  id: string;
  department: string;
  area: number;
  reason: string;
  status: AllocationStatus;
  requestedDate: string;
}

export interface DepartmentFee {
  id: string;
  departmentName: string;
  quotaArea: number;
  actualArea: number;
  excessArea: number;
  excessCost: number;
  status: FeeStatus;
  isPaid: boolean; // Legacy simplified flag, relying on status mainly
  hasReminder: boolean; // 是否收到催缴通知
}


export interface NavItem {
  id: string;
  label: string;
  icon: any; // Lucide icon component type
}

// 1. Asset Digitalization Types

export interface LandParcel {
  id: string;
  certNo: string; // 土地证号
  name: string;
  area: number;
  type: 'Campus' | 'Living'; // 校区用地 | 生活区用地
  status: 'Unstarted' | 'InProgress' | 'Stored'; // 未征迁 | 征迁中 | 已入库
  acquisitionMethod: 'Allocation' | 'Transfer'; // 划拨 | 出让
  redLineMap?: string; // 红线图 URL
}

export interface BuildingAsset {
  id: string;
  name: string;
  code: string;
  location: string;
  structure: 'Frame' | 'BrickConcrete' | 'Steel'; // 框架 | 砖混 | 钢结构
  value: number; // 原值
  status: 'Construction' | 'TitleDeed' | 'Deregistered'; // 在建 | 办证 | 注销
  completionDate: string;
  hasCad: boolean;
  floorCount: number;
}

export interface RoomAsset {
  id: string;
  roomNo: string;
  buildingName: string;
  area: number;
  type: 'Teaching' | 'Logistics' | 'Admin' | 'Student' | 'Commercial';
  status: 'Empty' | 'SelfUse' | 'Rented' | 'Occupied' | 'Maintenance';
  department: string;
  floor: number;
}

// 2. Rule Engine Types

export interface QuotaConfig {
  id: string;
  category: 'Personnel' | 'Student' | 'Discipline';
  name: string; // e.g., "Professor", "PhD Student"
  value: number; // Area in sqm or Coefficient
  unit: string; // "m²/person" or "coefficient"
  description?: string;
}

export interface FeeTier {
  id: string;
  minExcess: number; // Percentage 0-100
  maxExcess: number | null; // Null for infinity
  rateName: string; // "Rate A", "Rate B"
  multiplier: number; // e.g., 1.5x base price
  color: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  type: 'Utilization' | 'Safety' | 'Finance';
  thresholdValue: number;
  thresholdUnit: string; // "Months", "%", "Days"
  isEnabled: boolean;
  severity: 'High' | 'Medium' | 'Low';
}

export interface TodoItem {
  id: string;
  title: string;
  module: string; // e.g., '维修与物业', '公用房归口调配'
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  relatedId: string; // e.g., Ticket ID, Request ID
}
export interface Progress {
  timestamp: string;
  status: string;
  notes: string;
}

export interface RepairTicket {
  id: string;
  location: string;
  issue: string;
  reporter: string;
  status: 'Open' | 'Dispatched' | 'Completed';
  imageUrl?: string;
  date: string;
  progress?: Progress[];
  isUrged?: boolean;
}

// 地下空间管理
export interface UndergroundSpace {
  id: string;
  name: string;
  buildingName: string;
  floor: string; // B1, B2, etc.
  area: number;
  type: 'Parking' | 'Storage' | 'Equipment' | 'Civil_Defense' | 'Other';
  status: 'InUse' | 'Empty' | 'Maintenance';
  department: string;
}

// 构筑物管理
export interface Structure {
  id: string;
  name: string;
  type: 'Bridge' | 'Road' | 'Fence' | 'Sculpture' | 'Pavilion' | 'SportsFacility' | 'Other';
  location: string;
  area?: number;
  value: number;
  buildDate: string;
  status: 'Normal' | 'NeedRepair' | 'Demolished';
  isSchoolOwned: boolean; // 是否学校产权
}

// 房间变更申请
export interface RoomChangeRequest {
  id: string;
  type: 'Merge' | 'Split' | 'Modify';
  sourceRooms: string[]; // 原房间号
  targetRooms?: string[]; // 目标房间号（拆分时）
  reason: string;
  applicant: string;
  department: string;
  status: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected';
  attachments?: string[];
  createdAt: string;
  approvedAt?: string;
}

// 用房移交记录
export interface RoomTransferRecord {
  id: string;
  roomNo: string;
  buildingName: string;
  fromDepartment: string;
  toDepartment: string;
  transferDate: string;
  reason: string;
  approver: string;
  status: 'Completed' | 'Pending';
}

// 人员房间关联（用于一人多房/一房多人查询）
export interface PersonRoomRelation {
  id: string;
  personId: string;
  personName: string;
  department: string;
  title: string; // 职称
  roomId: string;
  roomNo: string;
  buildingName: string;
  area: number;
  useType: 'Office' | 'Lab' | 'Storage';
}

// 反馈记录
export interface FeedbackRecord {
  id: string;
  type: 'UserChange' | 'AreaAdjust' | 'InfoCorrection' | 'Other';
  roomNo: string;
  buildingName: string;
  content: string;
  submitter: string;
  submitterDept: string;
  status: 'Pending' | 'Reviewing' | 'Approved' | 'Rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewer?: string;
  reviewNotes?: string;
}

// ========== 公用房归口调配管理扩展类型 ==========

// 房源状态
export enum RoomAvailability {
  Available = 'Available',       // 可分配
  Occupied = 'Occupied',         // 已占用
  Reserved = 'Reserved',         // 已预留
  Maintenance = 'Maintenance',   // 维修中
  Pending = 'Pending'            // 待腾退
}

// 用房类型
export enum RoomUseType {
  Office = 'Office',             // 行政办公
  Teaching = 'Teaching',         // 教学用房
  Lab = 'Lab',                   // 科研实验室
  Student = 'Student',           // 学生用房
  Meeting = 'Meeting',           // 会议室
  Storage = 'Storage',           // 库房
  Other = 'Other'                // 其他
}

// 可分配房源
export interface AvailableRoom {
  id: string;
  roomNo: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  area: number;
  useType: RoomUseType;
  availability: RoomAvailability;
  facilities?: string[];         // 设施配置
  lastDepartment?: string;       // 上一使用单位 / 当前使用单位（简化复用）
  vacantSince?: string;          // 空置起始日期
  phone?: string;                // 联系电话
  assigneeDept?: string;         // 分配部门（如果有）
  assigneePerson?: string;       // 分配到个人（如果有）
  notes?: string;
}

// 部门定额信息
export interface DepartmentQuota {
  id: string;
  departmentName: string;
  personnelCount: number;        // 人员编制数
  studentCount: number;          // 学生数
  baseQuota: number;             // 基础定额 (m²)
  adjustedQuota: number;         // 调整后定额 (含学科系数)
  currentUsage: number;          // 当前使用面积
  remainingQuota: number;        // 剩余定额
  disciplineCoefficient: number; // 学科系数
  rooms: string[];               // 已分配房间ID列表
}

// 审批记录
export interface ApprovalRecord {
  id: string;
  requestId: string;
  level: number;                 // 审批层级 1/2/3
  approverRole: string;          // 审批人角色
  approverName: string;          // 审批人姓名
  action: 'Approve' | 'Reject' | 'Forward'; // 通过/驳回/转呈
  comment?: string;              // 审批意见
  timestamp: string;
}

// 扩展的用房申请
export interface ExtendedRoomRequest {
  id: string;
  department: string;
  applicant: string;             // 申请人
  applicantPhone?: string;       // 联系电话
  area: number;
  reason: string;
  useType: RoomUseType;          // 用途类型
  urgency: 'Normal' | 'Urgent';  // 紧急程度
  status: AllocationStatus;
  requestedDate: string;
  expectedDate?: string;         // 期望入住日期
  attachments?: string[];        // 附件
  approvalRecords?: ApprovalRecord[]; // 审批记录
  allocatedRooms?: string[];     // 已分配房间ID
  currentQuota?: number;         // 申请时的剩余定额
  isOverQuota?: boolean;         // 是否超定额
}

// 调配记录
export interface AllocationRecord {
  id: string;
  requestId?: string;            // 关联申请ID
  roomId: string;
  roomNo: string;
  buildingName: string;
  area: number;
  fromDepartment?: string;
  toDepartment: string;
  allocationType: 'New' | 'Transfer' | 'Return' | 'Adjust'; // 新分配/调拨/退还/调整
  effectiveDate: string;
  operator: string;
  notes?: string;
}

// 退房申请
export interface RoomReturnRequest {
  id: string;
  department: string;
  applicant: string;
  roomId: string;
  roomNo: string;
  buildingName: string;
  area: number;
  reason: string;
  expectedReturnDate: string;
  status: 'Pending' | 'Approved' | 'Completed';
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

// 临时借用
export interface TemporaryBorrow {
  id: string;
  roomId: string;
  roomNo: string;
  buildingName: string;
  borrowerDept: string;
  ownerDept: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Active' | 'Expired' | 'Returned';
  reminderSent?: boolean;
}
// 在 types.ts 中添加
export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'status_change';
  entityType: 'project' | 'attachment' | 'split_item' | 'milestone';
  entityId: string;
  entityName: string;
  changedFields?: Record<string, { old: any; new: any }>;
  operator: string;
  operatorRole: UserRole;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}