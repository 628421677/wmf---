import { Building, Alert, WorkOrder } from './types';

export const BUILDINGS: Building[] = [
  {
    id: 'B-TEACH-01',
    name: '第一教学楼',
    type: 'teaching',
    status: 'active',
    coordinates: { x: 400, y: 300 },
    totalArea: 12500,
    floorCount: 6,
    buildYear: 2010,
    occupancyRate: 85,
    manager: '张主任',
    lastSafetyCheck: '2023-11-15',
    energyUsage: 1240.5
  },
  {
    id: 'B-TEACH-02',
    name: '理科实验中心',
    type: 'teaching',
    status: 'active',
    coordinates: { x: 600, y: 250 },
    totalArea: 18000,
    floorCount: 8,
    buildYear: 2015,
    occupancyRate: 42,
    manager: '李教授',
    lastSafetyCheck: '2023-12-01',
    energyUsage: 2100.2
  },
  {
    id: 'B-DORM-N1',
    name: '北区宿舍 N1',
    type: 'dorm',
    status: 'active',
    coordinates: { x: 250, y: 450 },
    totalArea: 8000,
    floorCount: 6,
    buildYear: 2005,
    occupancyRate: 98,
    manager: '王宿管',
    lastSafetyCheck: '2023-10-20',
    energyUsage: 890.5
  },
  {
    id: 'B-DORM-N2',
    name: '北区宿舍 N2',
    type: 'dorm',
    status: 'maintenance',
    coordinates: { x: 350, y: 550 },
    totalArea: 8000,
    floorCount: 6,
    buildYear: 2005,
    occupancyRate: 15,
    manager: '王宿管',
    lastSafetyCheck: '2023-10-20',
    energyUsage: 120.0
  },
  {
    id: 'B-ADMIN-MAIN',
    name: '行政办公主楼',
    type: 'admin',
    status: 'active',
    coordinates: { x: 500, y: 500 },
    totalArea: 5400,
    floorCount: 4,
    buildYear: 1998,
    occupancyRate: 60,
    manager: '赵处长',
    lastSafetyCheck: '2023-11-30',
    energyUsage: 450.8
  },
  {
    id: 'B-FAC-GYM',
    name: '综合体育馆',
    type: 'facility',
    status: 'closed',
    coordinates: { x: 700, y: 450 },
    totalArea: 15000,
    floorCount: 2,
    buildYear: 2018,
    occupancyRate: 0,
    manager: '刘馆长',
    lastSafetyCheck: '2023-12-05',
    energyUsage: 150.0
  }
];

export const WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-20231201-01',
    targetId: 'B-DORM-N2',
    type: 'renovation',
    status: 'processing',
    description: 'N2宿舍楼外立面防水层翻新工程',
    date: '2023-12-01',
    priority: 'high'
  },
  {
    id: 'WO-20231203-02',
    targetId: 'B-TEACH-01',
    type: 'repair',
    status: 'pending',
    description: '302教室多媒体设备电路故障报修',
    date: '2023-12-03',
    priority: 'medium'
  },
  {
    id: 'WO-20231204-05',
    targetId: 'B-FAC-GYM',
    type: 'cleaning',
    status: 'completed',
    description: '主场馆赛前深度清洁',
    date: '2023-12-04',
    priority: 'low'
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'A-001',
    message: '行政楼门禁系统检测到异常尝试',
    timestamp: '10:42:15',
    level: 'warning',
    category: 'security'
  },
  {
    id: 'A-002',
    message: '北区宿舍N1电力负荷超标 (110%)',
    timestamp: '10:45:30',
    level: 'critical',
    category: 'energy'
  },
  {
    id: 'A-003',
    message: '理科实验中心火警探测器需维护',
    timestamp: '09:15:00',
    level: 'info',
    category: 'fire'
  }
];

export const OCCUPANCY_DATA = [
  { time: '08:00', value: 15 },
  { time: '09:00', value: 45 },
  { time: '10:00', value: 85 },
  { time: '11:00', value: 92 },
  { time: '12:00', value: 60 },
  { time: '13:00', value: 55 },
  { time: '14:00', value: 88 },
  { time: '15:00', value: 80 },
];

export const CAMPUS_COMPOSITION = [
  { name: '教学科研', value: 45, color: '#3B82F6' },
  { name: '学生公寓', value: 30, color: '#F59E0B' },
  { name: '行政办公', value: 10, color: '#8B5CF6' },
  { name: '生活配套', value: 15, color: '#10B981' },
];

export const CAMPUS_COMPOSITION_STANDARD = [
  { name: '教学科研', value: 40 },
  { name: '学生公寓', value: 35 },
  { name: '行政办公', value: 15 },
  { name: '生活配套', value: 10 },
];

export const COLLEGE_SPACE_DATA = [
  { name: '机械学院', value: 12500, color: '#3B82F6' },
  { name: '计算机', value: 9800, color: '#00F2FF' },
  { name: '土木工程', value: 15000, color: '#F59E0B' },
];

export const COLLEGE_REVENUE = [
  { name: '机械与汽车工程学院', value: 1680, target: 1800 },
  { name: '材料科学与工程学院', value: 1420, target: 1500 },
  { name: '电子电气与物理学院', value: 1560, target: 1600 },
  { name: '土木工程学院', value: 1450, target: 1500 },
  { name: '建筑与城乡规划学院', value: 1180, target: 1200 },
  { name: '管理学院', value: 2850, target: 3000 },
  { name: '生态环境与城市建设学院', value: 980, target: 1100 },
  { name: '交通运输学院', value: 1050, target: 1200 },
  { name: '计算机科学与数学学院', value: 2100, target: 2000 },
  { name: '互联网经贸学院', value: 1320, target: 1400 },
  { name: '设计学院', value: 980, target: 1000 },
  { name: '人文学院', value: 760, target: 900 },
  { name: '法学院·知识产权学院', value: 820, target: 900 },
  { name: '智慧海洋科学技术学院', value: 690, target: 800 },
];

export const EXTERNAL_REVENUE = [
  { name: '周转房收入', value: 3200, color: '#00F2FF' },
  { name: '场地租赁收入', value: 950, color: '#8B5CF6' },
];

export const TOP_ENERGY_CONSUMERS = [
  { name: '理科实验中心', value: 2100.2, change: '+12%', isHigh: true },
  { name: '第一教学楼', value: 1240.5, change: '-5%', isHigh: false },
  { name: '北区宿舍 N1', value: 890.5, change: '+8%', isHigh: true },
  { name: '图书馆总馆', value: 850.0, change: '-2%', isHigh: false },
  { name: '行政办公主楼', value: 450.8, change: '+1%', isHigh: false },
];

export const CAPITAL_PROJECTS = [
  { name: '东区人才公寓建设', progress: 75, status: 'normal', budget: '1.2亿' },
  { name: '老旧管网改造三期', progress: 30, status: 'delayed', budget: '450万' },
  { name: '智慧校园大脑部署', progress: 92, status: 'fast', budget: '800万' },
];
