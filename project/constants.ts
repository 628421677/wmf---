import { Project, AssetStatus, RoomRequest, AllocationStatus, DepartmentFee, RepairTicket, FeeStatus, LandParcel, BuildingAsset, RoomAsset, QuotaConfig, FeeTier, AlertConfig, TodoItem, UndergroundSpace, Structure, RoomChangeRequest, RoomTransferRecord, PersonRoomRelation, FeedbackRecord, FundSource, ProjectMilestone, AssetCategory, AvailableRoom, RoomAvailability, RoomUseType, DepartmentQuota, ExtendedRoomRequest, AllocationRecord, RoomReturnRequest, TemporaryBorrow, FeeStandard, FeeTierRule, FeeBill, PaymentRecord, ReminderRecord, VerificationRecord, DisputeRecord, ExtendedDepartmentFee } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-2023-001',
    name: '理科实验楼 A 座',
    contractAmount: 15000000,
    auditAmount: 14200000,
    auditReductionRate: 5.33,
    contractor: '环球建设集团',
    status: AssetStatus.FinalAccounting,
    completionDate: '2023-10-15',
    hasCadData: true,
    fundSource: FundSource.Fiscal,
    location: '旗山校区东侧',
    plannedArea: 8500,
    floorCount: 6,
    roomCount: 120,
    plannedStartDate: '2022-03-01',
    plannedEndDate: '2023-09-30',
    actualStartDate: '2022-03-15',
    actualEndDate: '2023-10-15',
    projectManager: '张工',
    supervisor: '福建建设监理有限公司',
    milestones: [
      { milestone: ProjectMilestone.Approval, date: '2021-12-01', operator: '资产处', notes: '省发改委批复' },
      { milestone: ProjectMilestone.Bidding, date: '2022-02-15', operator: '招标办', notes: '公开招标完成' },
      { milestone: ProjectMilestone.Construction, date: '2022-03-15', operator: '基建处', notes: '正式开工' },
      { milestone: ProjectMilestone.MainComplete, date: '2023-06-30', operator: '基建处', notes: '主体封顶' },
      { milestone: ProjectMilestone.Completion, date: '2023-10-15', operator: '基建处', notes: '竣工验收通过' },
    ],
    attachments: [
      { id: 'ATT-001', name: '立项批复文件.pdf', type: 'approval', uploadDate: '2021-12-05', uploadedByDept: '资产处', reviewStatus: 'Approved', reviewedBy: '资产管理员', reviewedAt: '2021-12-06', reviewNote: '材料齐全' },
      { id: 'ATT-002', name: '施工合同.pdf', type: 'contract', uploadDate: '2022-02-20', uploadedByDept: '招标办', reviewStatus: 'Approved', reviewedBy: '资产管理员', reviewedAt: '2022-02-21', reviewNote: '合同要素完整' },
      { id: 'ATT-003', name: '竣工验收报告.pdf', type: 'acceptance', uploadDate: '2023-10-20', uploadedByDept: '基建处', reviewStatus: 'Approved', reviewedBy: '资产管理员', reviewedAt: '2023-10-22', reviewNote: '签字页已补充' },
      { id: 'ATT-003-2', name: '决算审计报告.pdf', type: 'audit', uploadDate: '2023-11-01', uploadedByDept: '审计处', reviewStatus: 'Approved', reviewedBy: '资产管理员', reviewedAt: '2023-11-02', reviewNote: '审计通过' },
    ],
    splitItems: [
      { id: 'SPLIT-001', category: AssetCategory.Building, name: '理科实验楼A座主体', amount: 12000000, area: 8500, depreciationYears: 50, depreciationMethod: 'StraightLine' },
      { id: 'SPLIT-002', category: AssetCategory.Equipment, name: '电梯设备(2台)', amount: 1500000, quantity: 2, depreciationYears: 15, depreciationMethod: 'StraightLine' },
      { id: 'SPLIT-003', category: AssetCategory.Greening, name: '周边绿化工程', amount: 500000, area: 800, depreciationYears: 20, depreciationMethod: 'StraightLine' },
    ],
    gaojibiaoData: {
      buildingArea: 8500,
      structureType: '框架结构',
      floorCount: 6,
      useYears: 50,
      landArea: 2000,
      greenArea: 800,
    },
    isOverdue: true,
    overduedays: 15,
  },
  {
    id: 'PRJ-2023-004',
    name: '学生宿舍三期工程',
    contractAmount: 8500000,
    contractor: '城市建设股份有限公司',
    status: AssetStatus.Construction,
    completionDate: '2024-03-01',
    hasCadData: false,
    fundSource: FundSource.Mixed,
    location: '旗山校区生活区南侧',
    plannedArea: 12000,
    floorCount: 12,
    roomCount: 320,
    plannedStartDate: '2023-06-01',
    plannedEndDate: '2024-03-01',
    actualStartDate: '2023-06-15',
    projectManager: '李工',
    supervisor: '福州工程监理公司',
    milestones: [
      { milestone: ProjectMilestone.Approval, date: '2023-03-01', operator: '资产处', notes: '学校自筹+财政配套' },
      { milestone: ProjectMilestone.Bidding, date: '2023-05-20', operator: '招标办', notes: '邀请招标完成' },
      { milestone: ProjectMilestone.Construction, date: '2023-06-15', operator: '基建处', notes: '正式开工' },
    ],
    attachments: [
      { id: 'ATT-004', name: '立项批复文件.pdf', type: 'approval', uploadDate: '2023-03-05' },
      { id: 'ATT-005', name: '施工合同.pdf', type: 'contract', uploadDate: '2023-05-25' },
    ],
    isOverdue: false,
  },
  {
    id: 'PRJ-2022-008',
    name: '图书馆扩建工程',
    contractAmount: 22000000,
    auditAmount: 20500000,
    auditReductionRate: 6.82,
    finalAmount: 20500000,
    contractor: '福建建工集团',
    status: AssetStatus.Archive,
    completionDate: '2022-12-20',
    hasCadData: true,
    fundSource: FundSource.Fiscal,
    location: '旗山校区中轴线',
    plannedArea: 15000,
    floorCount: 8,
    roomCount: 260,
    plannedStartDate: '2021-03-01',
    plannedEndDate: '2022-12-01',
    actualStartDate: '2021-03-10',
    actualEndDate: '2022-12-20',
    projectManager: '王工',
    supervisor: '省建设监理公司',
    milestones: [
      { milestone: ProjectMilestone.Approval, date: '2020-11-01', operator: '资产处', notes: '省财政专项' },
      { milestone: ProjectMilestone.Bidding, date: '2021-02-15', operator: '招标办', notes: '公开招标' },
      { milestone: ProjectMilestone.Construction, date: '2021-03-10', operator: '基建处', notes: '开工' },
      { milestone: ProjectMilestone.MainComplete, date: '2022-08-30', operator: '基建处', notes: '主体完工' },
      { milestone: ProjectMilestone.Completion, date: '2022-12-20', operator: '基建处', notes: '竣工验收' },
      { milestone: ProjectMilestone.Audit, date: '2023-03-15', operator: '审计处', notes: '审计完成' },
      { milestone: ProjectMilestone.Transfer, date: '2023-06-01', operator: '资产处', notes: '正式转固' },
    ],
    splitItems: [
      { id: 'SPLIT-004', category: AssetCategory.Building, name: '图书馆扩建主体', amount: 18000000, area: 15000, depreciationYears: 50, depreciationMethod: 'StraightLine', assetCardNo: 'FW-2023-0156' },
      { id: 'SPLIT-005', category: AssetCategory.Equipment, name: '中央空调系统', amount: 2000000, quantity: 1, depreciationYears: 15, depreciationMethod: 'StraightLine', assetCardNo: 'SB-2023-0892' },
      { id: 'SPLIT-006', category: AssetCategory.Greening, name: '景观绿化', amount: 500000, area: 500, depreciationYears: 20, depreciationMethod: 'StraightLine', assetCardNo: 'QT-2023-0045' },
    ],
    gaojibiaoData: {
      buildingArea: 15000,
      structureType: '框架结构',
      floorCount: 8,
      useYears: 50,
      landArea: 3500,
      greenArea: 500,
    },
    isOverdue: false,
  },
];

export const MOCK_REQUESTS: RoomRequest[] = [
  {
    id: 'REQ-101',
    department: '计算机科学与技术学院',
    area: 300,
    reason: '新建人工智能(AI)科研实验室',
    status: AllocationStatus.PendingLevel1, // < 500m
    requestedDate: '2023-11-01'
  },
  {
    id: 'REQ-102',
    department: '机械工程学院',
    area: 1200,
    reason: '重型机械加工车间扩建',
    status: AllocationStatus.PendingLevel3, // > 1000m
    requestedDate: '2023-11-05'
  }
];

export const MOCK_FEES: DepartmentFee[] = [
  {
    id: 'FEE-001',
    departmentName: '物理学院',
    quotaArea: 1000,
    actualArea: 1200,
    excessArea: 200,
    excessCost: 24000,
    isPaid: false,
    status: FeeStatus.BillGenerated,
    hasReminder: false
  },
  {
    id: 'FEE-002',
    departmentName: '化学化工学院',
    quotaArea: 1500,
    actualArea: 1450,
    excessArea: 0,
    excessCost: 0,
    isPaid: true,
    status: FeeStatus.Completed,
    hasReminder: false
  },
  {
    id: 'FEE-003',
    departmentName: '人文艺术学院',
    quotaArea: 800,
    actualArea: 950,
    excessArea: 150,
    excessCost: 18000,
    isPaid: false,
    status: FeeStatus.BillGenerated,
    hasReminder: false
  }
];

export const MOCK_TICKETS: RepairTicket[] = [
  {
    id: 'TKT-5521',
    location: '图书馆 304 室',
    issue: '中央空调漏水',
    reporter: '张老师',
    status: 'Dispatched',
    imageUrl: 'https://picsum.photos/id/101/200/200',
    date: '2023-11-10',
    isUrged: false,
    progress: [
      { timestamp: '2023-11-10 09:30', status: '已提交', notes: '用户通过移动端提交报修。' },
      { timestamp: '2023-11-10 09:45', status: '已派单', notes: '系统智能派单至维修一组。' },
    ]
  },
  {
    id: 'TKT-5520',
    location: '行政楼 102 室',
    issue: '门把手损坏',
    reporter: '李主任',
    status: 'Completed',
    imageUrl: 'https://picsum.photos/id/102/200/200',
    date: '2023-11-09',
    isUrged: false,
    progress: [
      { timestamp: '2023-11-09 14:00', status: '已提交', notes: '用户提交报修。' },
      { timestamp: '2023-11-09 14:10', status: '已派单', notes: '派单至维修二组。' },
      { timestamp: '2023-11-09 16:30', status: '已完成', notes: '维修师傅已更换门把手。' },
    ]
  }
];

// --- Digitalization Mock Data ---

export const MOCK_LANDS: LandParcel[] = [
  {
    id: 'LND-001',
    certNo: '榕国用(2010)第00521号',
    name: '旗山校区主地块',
    area: 850000,
    type: 'Campus',
    status: 'Stored',
    acquisitionMethod: 'Allocation'
  },
  {
    id: 'LND-002',
    certNo: '待办理',
    name: '北区扩建预留地',
    area: 120000,
    type: 'Campus',
    status: 'InProgress',
    acquisitionMethod: 'Transfer'
  }
];

export const MOCK_BUILDINGS: BuildingAsset[] = [
  {
    id: 'BLD-A01',
    name: '行政办公大楼',
    code: '001',
    location: '旗山校区中轴线北侧',
    structure: 'Frame',
    value: 120000000,
    status: 'TitleDeed',
    completionDate: '2015-09-01',
    hasCad: true,
    floorCount: 12
  },
  {
    id: 'BLD-T05',
    name: '机械工程实验楼',
    code: '005',
    location: '旗山校区西侧',
    structure: 'Frame',
    value: 85000000,
    status: 'TitleDeed',
    completionDate: '2018-06-15',
    hasCad: true,
    floorCount: 6
  },
  {
    id: 'BLD-S02',
    name: '学生公寓二期3号楼',
    code: 'S03',
    location: '生活区南苑',
    structure: 'BrickConcrete',
    value: 45000000,
    status: 'Construction',
    completionDate: '2024-05-30',
    hasCad: false,
    floorCount: 6
  }
];

export const MOCK_ROOMS: RoomAsset[] = [
  { id: 'RM-101', roomNo: '101', buildingName: '行政办公大楼', area: 120, type: 'Admin', status: 'SelfUse', department: '党政办公室', floor: 1 },
  { id: 'RM-102', roomNo: '102', buildingName: '行政办公大楼', area: 80, type: 'Admin', status: 'SelfUse', department: '财务处', floor: 1 },
  { id: 'RM-305', roomNo: '305', buildingName: '机械工程实验楼', area: 240, type: 'Teaching', status: 'SelfUse', department: '机械工程学院', floor: 3 },
  { id: 'RM-306', roomNo: '306', buildingName: '机械工程实验楼', area: 150, type: 'Teaching', status: 'Maintenance', department: '机械工程学院', floor: 3 },
  { id: 'RM-101S', roomNo: '101', buildingName: '学生公寓二期3号楼', area: 35, type: 'Student', status: 'Empty', department: '学工处', floor: 1 },
];

// --- Rule Engine Mock Data ---

export const MOCK_QUOTA_CONFIGS: QuotaConfig[] = [
  { id: 'Q-01', category: 'Personnel', name: '正高级职称 (教授)', value: 24, unit: 'm²/人', description: '科研与行政办公合计' },
  { id: 'Q-02', category: 'Personnel', name: '副高级职称 (副教授)', value: 16, unit: 'm²/人', description: '科研与行政办公合计' },
  { id: 'Q-03', category: 'Personnel', name: '中级职称及以下', value: 9, unit: 'm²/人', description: '集中式办公' },
  { id: 'Q-04', category: 'Student', name: '博士研究生', value: 6, unit: 'm²/生', description: '工位及实验辅助' },
  { id: 'Q-05', category: 'Student', name: '硕士研究生', value: 3, unit: 'm²/生', description: '工位及实验辅助' },
  { id: 'Q-06', category: 'Discipline', name: '理工科系数', value: 1.2, unit: 'coefficient', description: '实验设备占地调整' },
  { id: 'Q-07', category: 'Discipline', name: '人文社科系数', value: 1.0, unit: 'coefficient', description: '标准办公' },
  { id: 'Q-08', category: 'Discipline', name: '艺术体育系数', value: 1.5, unit: 'coefficient', description: '排练场馆/器械需求' },
];

export const MOCK_FEE_TIERS: FeeTier[] = [
  { id: 'TIER-1', minExcess: 0, maxExcess: 30, rateName: '费率 A (基础调节)', multiplier: 1.0, color: 'bg-green-100 text-green-800' },
  { id: 'TIER-2', minExcess: 30, maxExcess: 60, rateName: '费率 B (惩罚性)', multiplier: 1.5, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'TIER-3', minExcess: 60, maxExcess: null, rateName: '费率 C (熔断性)', multiplier: 3.0, color: 'bg-red-100 text-red-800' },
];

export const MOCK_ALERT_CONFIGS: AlertConfig[] = [
  { id: 'ALT-01', name: '低利用率预警', type: 'Utilization', thresholdValue: 60, thresholdUnit: '%', isEnabled: true, severity: 'Medium' },
  { id: 'ALT-02', name: '空置时长预警', type: 'Utilization', thresholdValue: 6, thresholdUnit: '个月', isEnabled: true, severity: 'Medium' },
  { id: 'ALT-03', name: '消防整改超期', type: 'Safety', thresholdValue: 15, thresholdUnit: '天', isEnabled: true, severity: 'High' },
  { id: 'ALT-04', name: '结构鉴定超期', type: 'Safety', thresholdValue: 10, thresholdUnit: '年', isEnabled: true, severity: 'High' },
  { id: 'ALT-05', name: '欠费熔断阈值', type: 'Finance', thresholdValue: 45, thresholdUnit: '天', isEnabled: true, severity: 'High' },
];

export const MOCK_TODOS: TodoItem[] = [
  { id: 'TODO-001', title: '处理中央空调漏水报修', module: '维修与物业', priority: 'High', dueDate: '2023-11-12', relatedId: 'TKT-5521' },
  { id: 'TODO-002', title: '审批AI实验室用房申请', module: '公用房归口调配', priority: 'Medium', dueDate: '2023-11-15', relatedId: 'REQ-101' },
  { id: 'TODO-003', title: '催缴物理学院超额使用费', module: '公用房使用收费', priority: 'Medium', dueDate: '2023-11-20', relatedId: 'FEE-001' },
  { id: 'TODO-004', title: '启动学生宿舍三期工程转固', module: '资产建设与转固', priority: 'Low', dueDate: '2023-11-30', relatedId: 'PRJ-2023-004' },
];

export const MOCK_ALERTS = [
  { id: 'ALERT-001', type: '定额超标预警', details: '机械学院公用房超额比率达15%，已触发二级预警阈值。', timestamp: '10分钟前', priority: 'Medium' },
  { id: 'ALERT-002', type: '合同即将到期', details: '创新创业中心102商铺租赁合同将于30天后到期。', timestamp: '1小时前', priority: 'High' },
  { id: 'ALERT-003', type: '安全隐患整改', details: '理科楼A座消防栓水压不足，请立即派单维修。', timestamp: '昨天', priority: 'High' },
  { id: 'ALERT-004', type: '欠费熔断提醒', details: '土木学院年度公房费用逾期未缴，系统已冻结申请权限。', timestamp: '2天前', priority: 'High' },
  { id: 'ALERT-005', type: '闲置资源提醒', details: '老校区图书馆3楼连续6个月利用率低于10%。', timestamp: '3天前', priority: 'Low' },
  { id: 'ALERT-006', type: '资产转固延迟', details: '学生宿舍三期工程已竣工90天，请及时办理转固手续。', timestamp: '5天前', priority: 'Medium' },
  { id: 'ALERT-007', type: '维保计划提醒', details: '电梯年度维保合同将于下月到期，请准备续签。', timestamp: '上周', priority: 'Low' },
];

// --- 地下空间管理 Mock Data ---
export const MOCK_UNDERGROUND_SPACES: UndergroundSpace[] = [
  { id: 'UG-001', name: '地下停车场A区', buildingName: '行政办公大楼', floor: 'B1', area: 2500, type: 'Parking', status: 'InUse', department: '后勤管理处' },
  { id: 'UG-002', name: '设备机房', buildingName: '图书馆', floor: 'B1', area: 300, type: 'Equipment', status: 'InUse', department: '后勤管理处' },
  { id: 'UG-003', name: '人防工程储备库', buildingName: '学生公寓二期', floor: 'B2', area: 800, type: 'Civil_Defense', status: 'Empty', department: '保卫处' },
  { id: 'UG-004', name: '档案室', buildingName: '行政办公大楼', floor: 'B1', area: 150, type: 'Storage', status: 'InUse', department: '档案馆' },
];

// --- 构筑物管理 Mock Data ---
export const MOCK_STRUCTURES: Structure[] = [
  { id: 'STR-001', name: '校园主干道', type: 'Road', location: '旗山校区中轴线', area: 15000, value: 8000000, buildDate: '2010-09-01', status: 'Normal', isSchoolOwned: true },
  { id: 'STR-002', name: '景观桥', type: 'Bridge', location: '人工湖东侧', value: 1200000, buildDate: '2015-06-01', status: 'Normal', isSchoolOwned: true },
  { id: 'STR-003', name: '校园围墙', type: 'Fence', location: '校园周边', area: 3200, value: 500000, buildDate: '2010-09-01', status: 'NeedRepair', isSchoolOwned: true },
  { id: 'STR-004', name: '校训石雕', type: 'Sculpture', location: '行政楼前广场', value: 80000, buildDate: '2012-10-01', status: 'Normal', isSchoolOwned: true },
  { id: 'STR-005', name: '网球场', type: 'SportsFacility', location: '体育中心东侧', area: 1200, value: 300000, buildDate: '2018-03-01', status: 'Normal', isSchoolOwned: true },
  { id: 'STR-006', name: '移动通信基站', type: 'Other', location: '图书馆楼顶', value: 0, buildDate: '2020-01-01', status: 'Normal', isSchoolOwned: false },
];

// --- 房间变更申请 Mock Data ---
export const MOCK_ROOM_CHANGE_REQUESTS: RoomChangeRequest[] = [
  { 
    id: 'RCR-001', 
    type: 'Merge', 
    sourceRooms: ['行政办公大楼-301', '行政办公大楼-302'], 
    reason: '扩建会议室，需要合并两间办公室', 
    applicant: '张主任', 
    department: '党政办公室', 
    status: 'PendingReview',
    attachments: ['合并方案.pdf', '施工图纸.dwg'],
    createdAt: '2023-11-10'
  },
  { 
    id: 'RCR-002', 
    type: 'Split', 
    sourceRooms: ['机械工程实验楼-401'], 
    targetRooms: ['机械工程实验楼-401A', '机械工程实验楼-401B'],
    reason: '大实验室拆分为两个独立研究室', 
    applicant: '李教授', 
    department: '机械工程学院', 
    status: 'Approved',
    attachments: ['拆分方案.pdf'],
    createdAt: '2023-10-25',
    approvedAt: '2023-11-01'
  },
  { 
    id: 'RCR-003', 
    type: 'Modify', 
    sourceRooms: ['图书馆-205'], 
    reason: '房间面积测量有误，需修正为实际面积', 
    applicant: '王老师', 
    department: '图书馆', 
    status: 'Draft',
    createdAt: '2023-11-12'
  },
];

// --- 用房移交记录 Mock Data ---
export const MOCK_ROOM_TRANSFER_RECORDS: RoomTransferRecord[] = [
  { 
    id: 'RTR-001', 
    roomNo: '203', 
    buildingName: '理科实验楼', 
    fromDepartment: '物理学院', 
    toDepartment: '化学学院', 
    transferDate: '2023-09-01', 
    reason: '学科调整，实验室重新分配', 
    approver: '分管副校长', 
    status: 'Completed' 
  },
  { 
    id: 'RTR-002', 
    roomNo: '105', 
    buildingName: '行政办公大楼', 
    fromDepartment: '教务处', 
    toDepartment: '学工处', 
    transferDate: '2023-10-15', 
    reason: '部门办公用房调整', 
    approver: '资产处处长', 
    status: 'Completed' 
  },
  { 
    id: 'RTR-003', 
    roomNo: '302', 
    buildingName: '机械工程实验楼', 
    fromDepartment: '机械工程学院', 
    toDepartment: '材料科学与工程学院', 
    transferDate: '2023-11-20', 
    reason: '跨学院科研合作项目', 
    approver: '公用房领导小组', 
    status: 'Pending' 
  },
];

// --- 人员房间关联 Mock Data (用于一人多房/一房多人查询) ---
export const MOCK_PERSON_ROOM_RELATIONS: PersonRoomRelation[] = [
  { id: 'PR-001', personId: 'P001', personName: '张教授', department: '机械工程学院', title: '教授', roomId: 'RM-305', roomNo: '305', buildingName: '机械工程实验楼', area: 240, useType: 'Lab' },
  { id: 'PR-002', personId: 'P001', personName: '张教授', department: '机械工程学院', title: '教授', roomId: 'RM-401', roomNo: '401', buildingName: '机械工程实验楼', area: 30, useType: 'Office' },
  { id: 'PR-003', personId: 'P001', personName: '张教授', department: '机械工程学院', title: '教授', roomId: 'RM-B101', roomNo: 'B101', buildingName: '机械工程实验楼', area: 50, useType: 'Storage' },
  { id: 'PR-004', personId: 'P002', personName: '李副教授', department: '机械工程学院', title: '副教授', roomId: 'RM-305', roomNo: '305', buildingName: '机械工程实验楼', area: 240, useType: 'Lab' },
  { id: 'PR-005', personId: 'P003', personName: '王讲师', department: '机械工程学院', title: '讲师', roomId: 'RM-305', roomNo: '305', buildingName: '机械工程实验楼', area: 240, useType: 'Lab' },
  { id: 'PR-006', personId: 'P004', personName: '赵老师', department: '计算机学院', title: '副教授', roomId: 'RM-201', roomNo: '201', buildingName: '信息楼', area: 25, useType: 'Office' },
  { id: 'PR-007', personId: 'P005', personName: '刘主任', department: '党政办公室', title: '正处级', roomId: 'RM-101', roomNo: '101', buildingName: '行政办公大楼', area: 120, useType: 'Office' },
  { id: 'PR-008', personId: 'P006', personName: '陈副主任', department: '党政办公室', title: '副处级', roomId: 'RM-101', roomNo: '101', buildingName: '行政办公大楼', area: 120, useType: 'Office' },
];

// --- 反馈记录 Mock Data ---
export const MOCK_FEEDBACK_RECORDS: FeedbackRecord[] = [
  { 
    id: 'FB-001', 
    type: 'UserChange', 
    roomNo: '302', 
    buildingName: '理科实验楼', 
    content: '该房间使用人已变更为李老师，请更新系统记录', 
    submitter: '王老师', 
    submitterDept: '物理学院',
    status: 'Reviewing',
    createdAt: '2023-11-10'
  },
  { 
    id: 'FB-002', 
    type: 'AreaAdjust', 
    roomNo: '205', 
    buildingName: '图书馆', 
    content: '实测面积为85平米，系统记录为90平米，需要修正', 
    submitter: '张老师', 
    submitterDept: '图书馆',
    status: 'Approved',
    createdAt: '2023-11-05',
    reviewedAt: '2023-11-08',
    reviewer: '资产处-李管理员',
    reviewNotes: '已核实并更新'
  },
  { 
    id: 'FB-003', 
    type: 'InfoCorrection', 
    roomNo: '401', 
    buildingName: '机械工程实验楼', 
    content: '房间用途应为"科研实验室"而非"办公室"', 
    submitter: '赵教授', 
    submitterDept: '机械工程学院',
    status: 'Pending',
    createdAt: '2023-11-12'
  },
  { 
    id: 'FB-004', 
    type: 'Other', 
    roomNo: '103', 
    buildingName: '行政办公大楼', 
    content: '该房间已改造为会议室，请更新房间类型', 
    submitter: '孙主任', 
    submitterDept: '党政办公室',
    status: 'Rejected',
    createdAt: '2023-11-01',
    reviewedAt: '2023-11-03',
    reviewer: '资产处-王管理员',
    reviewNotes: '需提供改造审批文件'
  },
];


// ========== 公用房归口调配管理扩展 Mock Data ==========

// 可分配房源
export const MOCK_AVAILABLE_ROOMS: AvailableRoom[] = [
  { id: 'AR-001', roomNo: '501', buildingId: 'BLD-A01', buildingName: '行政办公大楼', floor: 5, area: 45, useType: RoomUseType.Office, availability: RoomAvailability.Available, facilities: ['空调', '网络'], vacantSince: '2023-10-01' },
  { id: 'AR-002', roomNo: '502', buildingId: 'BLD-A01', buildingName: '行政办公大楼', floor: 5, area: 60, useType: RoomUseType.Office, availability: RoomAvailability.Available, facilities: ['空调', '网络', '投影'], lastDepartment: '教务处', vacantSince: '2023-09-15' },
  { id: 'AR-003', roomNo: '308', buildingId: 'BLD-T05', buildingName: '机械工程实验楼', floor: 3, area: 120, useType: RoomUseType.Lab, availability: RoomAvailability.Available, facilities: ['空调', '网络', '通风系统'], vacantSince: '2023-08-20' },
  { id: 'AR-004', roomNo: '205', buildingId: 'BLD-T05', buildingName: '机械工程实验楼', floor: 2, area: 80, useType: RoomUseType.Lab, availability: RoomAvailability.Reserved, facilities: ['空调', '网络'], notes: '已预留给材料学院' },
  { id: 'AR-005', roomNo: '601', buildingId: 'BLD-A01', buildingName: '行政办公大楼', floor: 6, area: 100, useType: RoomUseType.Meeting, availability: RoomAvailability.Available, facilities: ['空调', '网络', '投影', '视频会议'], vacantSince: '2023-11-01' },
  { id: 'AR-006', roomNo: '103', buildingId: 'BLD-T05', buildingName: '机械工程实验楼', floor: 1, area: 200, useType: RoomUseType.Lab, availability: RoomAvailability.Maintenance, facilities: ['空调', '网络'], notes: '正在进行消防改造' },
  { id: 'AR-007', roomNo: 'B102', buildingId: 'BLD-A01', buildingName: '行政办公大楼', floor: -1, area: 50, useType: RoomUseType.Storage, availability: RoomAvailability.Available, vacantSince: '2023-07-01' },
  { id: 'AR-008', roomNo: '402', buildingId: 'BLD-T05', buildingName: '机械工程实验楼', floor: 4, area: 90, useType: RoomUseType.Lab, availability: RoomAvailability.Pending, lastDepartment: '物理学院', notes: '待腾退，预计12月底' },
  { id: 'AR-009', roomNo: '503', buildingId: 'BLD-A01', buildingName: '行政办公大楼', floor: 5, area: 35, useType: RoomUseType.Office, availability: RoomAvailability.Available, facilities: ['空调', '网络'], vacantSince: '2023-10-20' },
  { id: 'AR-010', roomNo: '210', buildingId: 'BLD-T05', buildingName: '机械工程实验楼', floor: 2, area: 150, useType: RoomUseType.Teaching, availability: RoomAvailability.Available, facilities: ['空调', '网络', '多媒体'], vacantSince: '2023-09-01' },
];

// 部门定额信息
export const MOCK_DEPARTMENT_QUOTAS: DepartmentQuota[] = [
  { id: 'DQ-001', departmentName: '计算机科学与技术学院', personnelCount: 85, studentCount: 420, baseQuota: 2800, adjustedQuota: 3360, currentUsage: 3100, remainingQuota: 260, disciplineCoefficient: 1.2, rooms: ['RM-201', 'RM-202', 'RM-301'] },
  { id: 'DQ-002', departmentName: '机械工程学院', personnelCount: 72, studentCount: 380, baseQuota: 2400, adjustedQuota: 2880, currentUsage: 3200, remainingQuota: -320, disciplineCoefficient: 1.2, rooms: ['RM-305', 'RM-306', 'RM-401'] },
  { id: 'DQ-003', departmentName: '人文艺术学院', personnelCount: 45, studentCount: 280, baseQuota: 1500, adjustedQuota: 2250, currentUsage: 1800, remainingQuota: 450, disciplineCoefficient: 1.5, rooms: ['RM-101', 'RM-102'] },
  { id: 'DQ-004', departmentName: '物理学院', personnelCount: 58, studentCount: 320, baseQuota: 1900, adjustedQuota: 2280, currentUsage: 2400, remainingQuota: -120, disciplineCoefficient: 1.2, rooms: ['RM-203', 'RM-204'] },
  { id: 'DQ-005', departmentName: '化学学院', personnelCount: 62, studentCount: 350, baseQuota: 2100, adjustedQuota: 2520, currentUsage: 2300, remainingQuota: 220, disciplineCoefficient: 1.2, rooms: ['RM-205', 'RM-206'] },
  { id: 'DQ-006', departmentName: '经济管理学院', personnelCount: 55, studentCount: 450, baseQuota: 1800, adjustedQuota: 1800, currentUsage: 1650, remainingQuota: 150, disciplineCoefficient: 1.0, rooms: ['RM-301', 'RM-302'] },
];

// 扩展的用房申请
export const MOCK_EXTENDED_REQUESTS: ExtendedRoomRequest[] = [
  {
    id: 'REQ-101',
    department: '计算机科学与技术学院',
    applicant: '张院长',
    applicantPhone: '13800138001',
    area: 300,
    reason: '新建人工智能(AI)科研实验室，用于深度学习模型训练和算法研究',
    useType: RoomUseType.Lab,
    urgency: 'Normal',
    status: AllocationStatus.PendingLevel1,
    requestedDate: '2023-11-01',
    expectedDate: '2024-01-01',
    attachments: ['申请报告.pdf', '实验室规划方案.docx'],
    currentQuota: 260,
    isOverQuota: true,
    approvalRecords: [
      { id: 'APR-001', requestId: 'REQ-101', level: 0, approverRole: '申请人', approverName: '张院长', action: 'Approve', comment: '提交申请', timestamp: '2023-11-01 09:30' }
    ]
  },
  {
    id: 'REQ-102',
    department: '机械工程学院',
    applicant: '李副院长',
    applicantPhone: '13800138002',
    area: 1200,
    reason: '重型机械加工车间扩建，满足新增数控机床设备安装需求',
    useType: RoomUseType.Lab,
    urgency: 'Urgent',
    status: AllocationStatus.PendingLevel3,
    requestedDate: '2023-11-05',
    expectedDate: '2024-03-01',
    attachments: ['扩建方案.pdf', '设备清单.xlsx'],
    currentQuota: -320,
    isOverQuota: true,
    approvalRecords: [
      { id: 'APR-002', requestId: 'REQ-102', level: 0, approverRole: '申请人', approverName: '李副院长', action: 'Approve', comment: '提交申请', timestamp: '2023-11-05 10:00' },
      { id: 'APR-003', requestId: 'REQ-102', level: 1, approverRole: '分管副校长', approverName: '王副校长', action: 'Forward', comment: '面积较大，需上报领导小组', timestamp: '2023-11-06 14:30' },
      { id: 'APR-004', requestId: 'REQ-102', level: 2, approverRole: '公用房领导小组', approverName: '领导小组', action: 'Forward', comment: '超过1000m²，需校长办公会研究', timestamp: '2023-11-08 16:00' }
    ]
  },
  {
    id: 'REQ-103',
    department: '人文艺术学院',
    applicant: '陈主任',
    applicantPhone: '13800138003',
    area: 150,
    reason: '新增书法工作室，用于书法教学和创作',
    useType: RoomUseType.Teaching,
    urgency: 'Normal',
    status: AllocationStatus.Approved,
    requestedDate: '2023-10-20',
    expectedDate: '2023-12-01',
    currentQuota: 450,
    isOverQuota: false,
    approvalRecords: [
      { id: 'APR-005', requestId: 'REQ-103', level: 0, approverRole: '申请人', approverName: '陈主任', action: 'Approve', comment: '提交申请', timestamp: '2023-10-20 11:00' },
      { id: 'APR-006', requestId: 'REQ-103', level: 1, approverRole: '分管副校长', approverName: '王副校长', action: 'Approve', comment: '同意，请资产处安排配房', timestamp: '2023-10-25 09:30' }
    ]
  },
  {
    id: 'REQ-104',
    department: '物理学院',
    applicant: '赵教授',
    applicantPhone: '13800138004',
    area: 80,
    reason: '申请光学实验室扩展空间',
    useType: RoomUseType.Lab,
    urgency: 'Normal',
    status: AllocationStatus.Rejected,
    requestedDate: '2023-10-15',
    currentQuota: -120,
    isOverQuota: true,
    approvalRecords: [
      { id: 'APR-007', requestId: 'REQ-104', level: 0, approverRole: '申请人', approverName: '赵教授', action: 'Approve', comment: '提交申请', timestamp: '2023-10-15 14:00' },
      { id: 'APR-008', requestId: 'REQ-104', level: 1, approverRole: '分管副校长', approverName: '王副校长', action: 'Reject', comment: '贵院已超定额320m²，请先清理闲置用房后再申请', timestamp: '2023-10-18 10:30' }
    ]
  },
  {
    id: 'REQ-105',
    department: '经济管理学院',
    applicant: '刘院长',
    applicantPhone: '13800138005',
    area: 200,
    reason: '新建案例教学研讨室',
    useType: RoomUseType.Teaching,
    urgency: 'Normal',
    status: AllocationStatus.Allocated,
    requestedDate: '2023-09-10',
    expectedDate: '2023-10-15',
    currentQuota: 150,
    isOverQuota: true,
    allocatedRooms: ['AR-005'],
    approvalRecords: [
      { id: 'APR-009', requestId: 'REQ-105', level: 0, approverRole: '申请人', approverName: '刘院长', action: 'Approve', comment: '提交申请', timestamp: '2023-09-10 09:00' },
      { id: 'APR-010', requestId: 'REQ-105', level: 1, approverRole: '分管副校长', approverName: '王副校长', action: 'Approve', comment: '同意', timestamp: '2023-09-15 11:00' }
    ]
  }
];

// 调配记录
export const MOCK_ALLOCATION_RECORDS: AllocationRecord[] = [
  { id: 'ALR-001', requestId: 'REQ-105', roomId: 'AR-005', roomNo: '601', buildingName: '行政办公大楼', area: 100, toDepartment: '经济管理学院', allocationType: 'New', effectiveDate: '2023-10-15', operator: '资产处-李管理员', notes: '用于案例教学研讨室' },
  { id: 'ALR-002', roomId: 'RM-203', roomNo: '203', buildingName: '理科实验楼', area: 85, fromDepartment: '物理学院', toDepartment: '化学学院', allocationType: 'Transfer', effectiveDate: '2023-09-01', operator: '资产处-王管理员', notes: '学科调整' },
  { id: 'ALR-003', roomId: 'RM-105', roomNo: '105', buildingName: '行政办公大楼', area: 60, fromDepartment: '教务处', toDepartment: '学工处', allocationType: 'Transfer', effectiveDate: '2023-10-15', operator: '资产处-李管理员' },
  { id: 'ALR-004', roomId: 'AR-002', roomNo: '502', buildingName: '行政办公大楼', area: 60, fromDepartment: '教务处', toDepartment: '', allocationType: 'Return', effectiveDate: '2023-09-15', operator: '资产处-王管理员', notes: '教务处主动退还' },
  { id: 'ALR-005', roomId: 'RM-301', roomNo: '301', buildingName: '信息楼', area: 45, toDepartment: '计算机科学与技术学院', allocationType: 'Adjust', effectiveDate: '2023-08-01', operator: '资产处-李管理员', notes: '面积调整' },
];

// 退房申请
export const MOCK_RETURN_REQUESTS: RoomReturnRequest[] = [
  { id: 'RET-001', department: '教务处', applicant: '孙处长', roomId: 'AR-002', roomNo: '502', buildingName: '行政办公大楼', area: 60, reason: '部门搬迁，原办公室不再使用', expectedReturnDate: '2023-09-15', status: 'Completed', createdAt: '2023-09-01', approvedAt: '2023-09-05', completedAt: '2023-09-15' },
  { id: 'RET-002', department: '物理学院', applicant: '钱教授', roomId: 'AR-008', roomNo: '402', buildingName: '机械工程实验楼', area: 90, reason: '实验项目结题，实验室不再需要', expectedReturnDate: '2023-12-31', status: 'Approved', createdAt: '2023-11-10', approvedAt: '2023-11-12' },
  { id: 'RET-003', department: '化学学院', applicant: '周老师', roomId: 'RM-207', roomNo: '207', buildingName: '理科实验楼', area: 40, reason: '人员调动，办公室空置', expectedReturnDate: '2024-01-15', status: 'Pending', createdAt: '2023-11-15' },
];

// 临时借用
export const MOCK_TEMPORARY_BORROWS: TemporaryBorrow[] = [
  { id: 'TB-001', roomId: 'RM-601', roomNo: '601', buildingName: '行政办公大楼', borrowerDept: '招生办', ownerDept: '会议中心', startDate: '2023-11-01', endDate: '2023-11-30', reason: '招生宣传季临时办公', status: 'Active', reminderSent: false },
  { id: 'TB-002', roomId: 'RM-305', roomNo: '305', buildingName: '机械工程实验楼', borrowerDept: '材料学院', ownerDept: '机械工程学院', startDate: '2023-10-01', endDate: '2023-10-31', reason: '联合科研项目', status: 'Expired', reminderSent: true },
  { id: 'TB-003', roomId: 'RM-102', roomNo: '102', buildingName: '行政办公大楼', borrowerDept: '校友会', ownerDept: '财务处', startDate: '2023-11-15', endDate: '2024-01-15', reason: '校庆筹备临时办公', status: 'Active', reminderSent: false },
];


// ========== 收费管理扩展 Mock Data ==========

// 收费标准配置
export const MOCK_FEE_STANDARDS: FeeStandard[] = [
  { id: 'FS-001', name: '行政办公用房标准', useType: RoomUseType.Office, basePrice: 120, effectiveDate: '2024-01-01', isActive: true, description: '适用于行政办公类房间' },
  { id: 'FS-002', name: '教学用房标准', useType: RoomUseType.Teaching, basePrice: 80, effectiveDate: '2024-01-01', isActive: true, description: '适用于普通教室、多媒体教室' },
  { id: 'FS-003', name: '科研实验室标准', useType: RoomUseType.Lab, basePrice: 150, effectiveDate: '2024-01-01', isActive: true, description: '适用于科研实验室' },
  { id: 'FS-004', name: '学生用房标准', useType: RoomUseType.Student, basePrice: 60, effectiveDate: '2024-01-01', isActive: true, description: '适用于学生活动室等' },
  { id: 'FS-005', name: '会议室标准', useType: RoomUseType.Meeting, basePrice: 100, effectiveDate: '2024-01-01', isActive: true, description: '适用于会议室' },
  { id: 'FS-006', name: '库房标准', useType: RoomUseType.Storage, basePrice: 40, effectiveDate: '2024-01-01', isActive: true, description: '适用于库房、储藏室' },
];

// 阶梯收费规则
export const MOCK_FEE_TIER_RULES: FeeTierRule[] = [
  { id: 'FTR-001', standardId: 'default', minExcessPercent: 0, maxExcessPercent: 10, multiplier: 1.0, description: '超额10%以内，按基础单价收费' },
  { id: 'FTR-002', standardId: 'default', minExcessPercent: 10, maxExcessPercent: 30, multiplier: 1.5, description: '超额10%-30%，按1.5倍收费' },
  { id: 'FTR-003', standardId: 'default', minExcessPercent: 30, maxExcessPercent: 50, multiplier: 2.0, description: '超额30%-50%，按2倍收费' },
  { id: 'FTR-004', standardId: 'default', minExcessPercent: 50, maxExcessPercent: null, multiplier: 3.0, description: '超额50%以上，按3倍收费（熔断费率）' },
];

// 账单数据
export const MOCK_FEE_BILLS: FeeBill[] = [
  { id: 'BILL-001', billNo: 'GF-2025-001', year: 2025, departmentId: 'DEPT-001', departmentName: '物理学院', quotaArea: 1000, actualArea: 1200, excessArea: 200, basePrice: 120, tierMultiplier: 1.5, calculatedAmount: 36000, status: FeeStatus.BillGenerated, generatedAt: '2025-01-10', operator: '系统自动' },
  { id: 'BILL-002', billNo: 'GF-2025-002', year: 2025, departmentId: 'DEPT-002', departmentName: '化学化工学院', quotaArea: 1500, actualArea: 1450, excessArea: 0, basePrice: 120, tierMultiplier: 1.0, calculatedAmount: 0, status: FeeStatus.Completed, generatedAt: '2025-01-10', confirmedAt: '2025-01-12', paidAt: '2025-01-15', operator: '系统自动' },
  { id: 'BILL-003', billNo: 'GF-2025-003', year: 2025, departmentId: 'DEPT-003', departmentName: '人文艺术学院', quotaArea: 800, actualArea: 950, excessArea: 150, basePrice: 120, tierMultiplier: 1.5, calculatedAmount: 27000, status: FeeStatus.PendingConfirm, generatedAt: '2025-01-10', operator: '系统自动' },
  { id: 'BILL-004', billNo: 'GF-2025-004', year: 2025, departmentId: 'DEPT-004', departmentName: '机械工程学院', quotaArea: 1200, actualArea: 1800, excessArea: 600, basePrice: 150, tierMultiplier: 2.0, calculatedAmount: 180000, status: FeeStatus.Disputed, generatedAt: '2025-01-10', operator: '系统自动', remarks: '学院对面积数据有异议' },
  { id: 'BILL-005', billNo: 'GF-2025-005', year: 2025, departmentId: 'DEPT-005', departmentName: '计算机学院', quotaArea: 1100, actualArea: 1250, excessArea: 150, basePrice: 150, tierMultiplier: 1.5, calculatedAmount: 33750, status: FeeStatus.FinanceProcessing, generatedAt: '2025-01-10', confirmedAt: '2025-01-13', operator: '系统自动' },
];

// 缴费记录
export const MOCK_PAYMENT_RECORDS: PaymentRecord[] = [
  { id: 'PAY-001', billId: 'BILL-002', billNo: 'GF-2025-002', departmentName: '化学化工学院', amount: 0, paymentMethod: 'FinanceDeduction', paymentDate: '2025-01-15', transactionNo: 'TXN-20250115-001', operator: '财务处-张会计', confirmedBy: '财务处-李主任', confirmedAt: '2025-01-15', status: 'Confirmed', remarks: '无超额费用' },
  { id: 'PAY-002', billId: 'BILL-005', billNo: 'GF-2025-005', departmentName: '计算机学院', amount: 33750, paymentMethod: 'BankTransfer', paymentDate: '2025-01-14', transactionNo: 'TXN-20250114-003', voucherUrl: '/vouchers/pay-002.pdf', operator: '计算机学院-王老师', status: 'Pending', remarks: '已转账，待财务确认' },
];

// 催缴记录
export const MOCK_REMINDER_RECORDS: ReminderRecord[] = [
  { id: 'REM-001', billId: 'BILL-001', billNo: 'GF-2025-001', departmentName: '物理学院', reminderType: 'System', content: '您的2025年度公房使用费账单已生成，超额费用36,000元，请及时确认并缴费。', sentAt: '2025-01-10 10:00', sentBy: '系统', isRead: true, readAt: '2025-01-10 14:30' },
  { id: 'REM-002', billId: 'BILL-001', billNo: 'GF-2025-001', departmentName: '物理学院', reminderType: 'OA', content: '【催缴通知】贵院2025年度公房超额使用费36,000元尚未缴纳，请于1月31日前完成缴费，逾期将影响新增用房申请。', sentAt: '2025-01-15 09:00', sentBy: '资产处-李管理员', isRead: false },
  { id: 'REM-003', billId: 'BILL-003', billNo: 'GF-2025-003', departmentName: '人文艺术学院', reminderType: 'System', content: '您的2025年度公房使用费账单已生成，请登录系统确认。', sentAt: '2025-01-10 10:00', sentBy: '系统', isRead: true, readAt: '2025-01-11 09:15' },
];

// 数据核对记录
export const MOCK_VERIFICATION_RECORDS: VerificationRecord[] = [
  { id: 'VER-001', billId: 'BILL-004', departmentName: '机械工程学院', verifyType: 'AreaCheck', originalValue: 1800, reportedValue: 1650, finalValue: 1800, status: 'Pending', submittedBy: '机械学院-赵主任', submittedAt: '2025-01-12 11:00' },
];

// 争议记录
export const MOCK_DISPUTE_RECORDS: DisputeRecord[] = [
  { id: 'DIS-001', billId: 'BILL-004', billNo: 'GF-2025-004', departmentName: '机械工程学院', disputeType: 'AreaDispute', description: '系统记录的实际占用面积1800m²与我院统计的1650m²不符，其中305实验室已于2024年10月退还，面积150m²应予扣除。', evidence: ['退房申请单.pdf', '移交确认书.pdf'], status: 'UnderReview', submittedBy: '机械学院-赵主任', submittedAt: '2025-01-12 14:00' },
];

// 扩展的部门费用数据
export const MOCK_EXTENDED_FEES: ExtendedDepartmentFee[] = [
  { id: 'EF-001', departmentName: '物理学院', year: 2025, quotaArea: 1000, actualArea: 1200, excessArea: 200, excessPercent: 20, basePrice: 120, tierMultiplier: 1.5, baseCost: 24000, tierCost: 12000, totalCost: 36000, excessCost: 36000, paidAmount: 0, remainingAmount: 36000, status: FeeStatus.BillGenerated, isPaid: false, hasReminder: true, reminderCount: 2, lastReminderAt: '2025-01-15', isBlacklisted: false },
  { id: 'EF-002', departmentName: '化学化工学院', year: 2025, quotaArea: 1500, actualArea: 1450, excessArea: 0, excessPercent: 0, basePrice: 120, tierMultiplier: 1.0, baseCost: 0, tierCost: 0, totalCost: 0, excessCost: 0, paidAmount: 0, remainingAmount: 0, status: FeeStatus.Completed, isPaid: true, hasReminder: false, reminderCount: 0, confirmedAt: '2025-01-12', paidAt: '2025-01-15', isBlacklisted: false },
  { id: 'EF-003', departmentName: '人文艺术学院', year: 2025, quotaArea: 800, actualArea: 950, excessArea: 150, excessPercent: 18.75, basePrice: 120, tierMultiplier: 1.5, baseCost: 18000, tierCost: 9000, totalCost: 27000, excessCost: 27000, paidAmount: 0, remainingAmount: 27000, status: FeeStatus.PendingConfirm, isPaid: false, hasReminder: true, reminderCount: 1, lastReminderAt: '2025-01-10', isBlacklisted: false },
  { id: 'EF-004', departmentName: '机械工程学院', year: 2025, quotaArea: 1200, actualArea: 1800, excessArea: 600, excessPercent: 50, basePrice: 150, tierMultiplier: 2.0, baseCost: 90000, tierCost: 90000, totalCost: 180000, excessCost: 180000, paidAmount: 0, remainingAmount: 180000, status: FeeStatus.Disputed, isPaid: false, hasReminder: false, reminderCount: 0, isBlacklisted: false },
  { id: 'EF-005', departmentName: '计算机学院', year: 2025, quotaArea: 1100, actualArea: 1250, excessArea: 150, excessPercent: 13.6, basePrice: 150, tierMultiplier: 1.5, baseCost: 22500, tierCost: 11250, totalCost: 33750, excessCost: 33750, paidAmount: 33750, remainingAmount: 0, status: FeeStatus.FinanceProcessing, isPaid: false, hasReminder: false, reminderCount: 0, confirmedAt: '2025-01-13', isBlacklisted: false },
  { id: 'EF-006', departmentName: '土木工程学院', year: 2025, quotaArea: 900, actualArea: 1350, excessArea: 450, excessPercent: 50, basePrice: 120, tierMultiplier: 2.0, baseCost: 54000, tierCost: 54000, totalCost: 108000, excessCost: 108000, paidAmount: 0, remainingAmount: 108000, status: FeeStatus.BillGenerated, isPaid: false, hasReminder: true, reminderCount: 3, lastReminderAt: '2025-01-14', isBlacklisted: true },
];
