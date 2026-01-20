export type RoomFunctionMainCategory =
  | 'Teaching'
  | 'Research'
  | 'Admin'
  | 'LifeService'
  | 'Commercial'
  | 'Auxiliary';

export type RoomFunctionSubCategory = string;

export interface RoomFunctionCatalogItem {
  main: RoomFunctionMainCategory;
  mainLabel: string;
  sub: RoomFunctionSubCategory;
  subLabel: string;
  description?: string;
  examples?: string[];
}

export const ROOM_FUNCTION_CATALOG: RoomFunctionCatalogItem[] = [
  // 一、教学用房
  { main: 'Teaching', mainLabel: '教学用房', sub: 'TheoryClassroom', subLabel: '理论教室', description: '以理论授课为主，配备基础教学设备，按规模划分规格', examples: ['普通教室', '阶梯教室', '合班教室'] },
  { main: 'Teaching', mainLabel: '教学用房', sub: 'PracticeClassroom', subLabel: '实践教室', description: '配套课程实操训练，侧重动手能力培养，需基础实训设施', examples: ['计算机教室', '语音教室', '绘画教室'] },
  { main: 'Teaching', mainLabel: '教学用房', sub: 'SmartClassroom', subLabel: '智慧教室', description: '融合信息化设备，支持互动教学、远程授课、小组研讨模式', examples: ['录播教室', '翻转课堂教室', '研讨室'] },
  { main: 'Teaching', mainLabel: '教学用房', sub: 'ExamClassroom', subLabel: '考试专用教室', description: '满足标准化考试需求，配备监控、信号屏蔽等设备', examples: ['四六级考场', '考研标准化考场'] },

  // 二、科研用房
  { main: 'Research', mainLabel: '科研用房', sub: 'BasicLab', subLabel: '基础实验室', description: '开展基础学科研究，配备通用实验设备，面向本科生、研究生基础实验', examples: ['物理实验室', '化学实验室', '生物实验室'] },
  { main: 'Research', mainLabel: '科研用房', sub: 'ProfessionalLab', subLabel: '专业实验室', description: '服务院系专业研究，配备专用实验设备，聚焦学科前沿方向', examples: ['材料合成实验室', '芯片研发实验室'] },
  { main: 'Research', mainLabel: '科研用房', sub: 'KeyLab', subLabel: '重点实验室', description: '校级/省级/国家级科研平台，配备高精尖设备，承担重大科研项目', examples: ['国家重点实验室', '工程研究中心'] },
  { main: 'Research', mainLabel: '科研用房', sub: 'ResearchAux', subLabel: '科研辅助用房', description: '支撑实验室运行，保障科研流程合规性、安全性', examples: ['试剂储藏室', '仪器校准室', '样品留样室'] },

  // 三、行政办公用房
  { main: 'Admin', mainLabel: '行政办公用房', sub: 'FunctionalOffice', subLabel: '职能部门办公室', description: '学校机关职能部门办公场所，按科室划分办公区域', examples: ['教务处办公室', '学生处办公室', '财务处办公室'] },
  { main: 'Admin', mainLabel: '行政办公用房', sub: 'CollegeOffice', subLabel: '院系办公用房', description: '各教学院系的行政、教学管理办公场所', examples: ['文学院办公室', '机械工程学院办公室'] },
  { main: 'Admin', mainLabel: '行政办公用房', sub: 'MeetingReception', subLabel: '会议接待用房', description: '用于校内会议、对外接待，按规模配置会议设备', examples: ['校党委会议室', '院系研讨室', '贵宾接待室'] },
  { main: 'Admin', mainLabel: '行政办公用房', sub: 'PublicServiceOffice', subLabel: '公共办公服务区', description: '面向全校师生的政务服务窗口，集中办理各类业务', examples: ['行政服务大厅', '档案查询室'] },

  // 四、生活服务用房
  { main: 'LifeService', mainLabel: '生活服务用房', sub: 'StudentDorm', subLabel: '学生宿舍', description: '学生住宿场所，按房型、配置划分档次', examples: ['四人间宿舍', '研究生公寓', '留学生公寓'] },
  { main: 'LifeService', mainLabel: '生活服务用房', sub: 'StaffTurnover', subLabel: '教职工周转房', description: '为引进人才、新进教职工提供的临时居住用房', examples: ['青年教师周转公寓', '专家公寓'] },
  { main: 'LifeService', mainLabel: '生活服务用房', sub: 'Catering', subLabel: '餐饮服务用房', description: '满足师生就餐需求，配套厨房、就餐区等设施', examples: ['学生食堂', '教工餐厅', '风味小吃档口'] },
  { main: 'LifeService', mainLabel: '生活服务用房', sub: 'PublicServiceLife', subLabel: '公共服务用房', description: '提供生活配套服务，保障师生日常需求', examples: ['校医院诊室', '图书馆阅览室', '浴室'] },

  // 五、经营性用房
  { main: 'Commercial', mainLabel: '经营性用房', sub: 'CampusCommercial', subLabel: '校园商业用房', description: '面向师生提供商业服务，需办理合规经营手续', examples: ['超市', '文具店', '打印社', '咖啡店'] },
  { main: 'Commercial', mainLabel: '经营性用房', sub: 'IndustryUniversity', subLabel: '校企合作用房', description: '用于校企联合研发、实训基地建设，实现产学研融合', examples: ['校企联合实验室', '实训中心'] },
  { main: 'Commercial', mainLabel: '经营性用房', sub: 'ExternalLease', subLabel: '对外租赁用房', description: '闲置资源对外合规租赁，获取收益补充办学经费', examples: ['校外企业驻校办公点', '商铺'] },

  // 六、附属用房
  { main: 'Auxiliary', mainLabel: '附属用房', sub: 'LogisticsSupport', subLabel: '后勤保障用房', description: '支撑学校水、电、暖、安防等系统运行', examples: ['配电室', '水泵房', '监控室', '仓库'] },
  { main: 'Auxiliary', mainLabel: '附属用房', sub: 'SecurityEmergency', subLabel: '安防应急用房', description: '用于校园安全管理、应急处置，配备专业设备', examples: ['消防控制室', '安保值班室', '应急物资储备室'] },
  { main: 'Auxiliary', mainLabel: '附属用房', sub: 'OtherAux', subLabel: '其他附属用房', description: '无法归入以上类别，保障校园正常运转的功能性用房' },
];

export function getMainCategories() {
  const seen = new Set<RoomFunctionMainCategory>();
  const res: { value: RoomFunctionMainCategory; label: string }[] = [];
  ROOM_FUNCTION_CATALOG.forEach(i => {
    if (seen.has(i.main)) return;
    seen.add(i.main);
    res.push({ value: i.main, label: i.mainLabel });
  });
  return res;
}

export function getSubCategories(main: RoomFunctionMainCategory) {
  return ROOM_FUNCTION_CATALOG.filter(i => i.main === main).map(i => ({
    value: i.sub,
    label: i.subLabel,
  }));
}

export function getRoomFunctionLabel(main?: RoomFunctionMainCategory, sub?: RoomFunctionSubCategory) {
  if (!main || !sub) return '-';
  const hit = ROOM_FUNCTION_CATALOG.find(i => i.main === main && i.sub === sub);
  if (!hit) return '-';
  return `${hit.mainLabel} / ${hit.subLabel}`;
}



