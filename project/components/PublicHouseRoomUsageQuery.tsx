import React, { useMemo, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { MOCK_AVAILABLE_ROOMS, MOCK_ROOM_TRANSFER_RECORDS, MOCK_ROOM_CHANGE_REQUESTS, MOCK_PERSON_ROOM_RELATIONS } from '../constants';
import { RoomUseType } from '../types';

// 合规状态类型定义
export type UsageComplianceStatus = '完全合规（实际 = 核定）' | '擅自变更（实际≠核定）' | '待核查';

// 变更记录类型
type ChangeRecord = {
  hasChange: boolean;
  approvalNo: string;
  changeDate: string;
};

// 表格行数据接口
export interface RoomUsageRow {
  id: string;
  roomId: string;
  building: string;
  floor: string;
  roomNo: string;
  buildingArea: number;
  approvedPurpose: string;
  approvedPurposeDetail: string;
  actualPurpose: string;
  purposeSubType: string;
  changeRecord: ChangeRecord;
  deptAndOwner: string;
  phone: string;
  complianceStatus: UsageComplianceStatus;
  idleInfo: string;
  remark: string;
}

// 表单数据类型（排除自动计算的字段）
type RoomUsageFormData = Omit<RoomUsageRow, 'id' | 'complianceStatus'> & {
  id?: string;
};

// 生成随机ID工具函数
const generateId = () => Math.random().toString(36).slice(2, 11);

// 合规状态徽章样式
const getStatusBadgeClass = (status: UsageComplianceStatus) => {
  switch (status) {
    case '完全合规（实际 = 核定）':
      return 'bg-green-50 text-green-700 border-green-200';
    case '擅自变更（实际≠核定）':
      return 'bg-red-50 text-red-700 border-red-200';
    case '待核查':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// 面积格式化
const formatArea = (n: number) => `${n.toFixed(0)}㎡`;

// 房间用途类型标签转换
const getUseTypeLabel = (t: RoomUseType) => {
  const labels: Record<RoomUseType, string> = {
    [RoomUseType.Office]: '行政办公室',
    [RoomUseType.Teaching]: '教学用房',
    [RoomUseType.Lab]: '科研实验室',
    [RoomUseType.Student]: '学生用房',
    [RoomUseType.Meeting]: '会议室',
    [RoomUseType.Storage]: '库房',
    [RoomUseType.Other]: '其他',
  };
  return labels[t] || '其他';
};

// 楼层标签转换（地下楼层显示为B+数字）
const toFloorLabel = (floor: number) => (floor > 0 ? `${floor}F` : `B${Math.abs(floor)}`);

// 核定用途详情映射
const mapApprovedPurposeDetail = (t: RoomUseType) => {
  switch (t) {
    case RoomUseType.Lab:
      return '基础化学实验室';
    case RoomUseType.Office:
      return '行政办公室';
    case RoomUseType.Teaching:
      return '多媒体教室';
    case RoomUseType.Storage:
      return '仪器库房';
    case RoomUseType.Meeting:
      return '会议室';
    case RoomUseType.Student:
      return '学生活动室';
    default:
      return '其他';
  }
};

// 闲置信息计算
const computeIdleInfo = (availability: any, vacantSince?: string) => {
  if (!vacantSince) return availability === 'Available' ? '闲置（起始时间待补）' : '否';
  if (availability !== 'Available') return '否';
  const ms = Date.now() - new Date(vacantSince).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '闲置（起始时间异常）';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  if (months >= 1) return `闲置 ${months} 个月`;
  return `闲置 ${Math.max(days, 1)} 天`;
};

// 合规状态计算（实际用途与核定用途对比）
const computeComplianceStatus = (approvedPurpose: string, actualPurpose: string): UsageComplianceStatus => {
  if (!actualPurpose || actualPurpose === '待核查') return '待核查';
  return actualPurpose === approvedPurpose ? '完全合规（实际 = 核定）' : '擅自变更（实际≠核定）';
};

// 本地存储KEY
const STORAGE_KEY = 'public-house-room-usage-rows-v1';

// 本地存储Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [storedValue, setValue] as const;
}

// 下拉选项常量
const APPROVED_PURPOSE_OPTIONS = [
  '行政办公室',
  '教学用房',
  '科研实验室',
  '学生用房',
  '会议室',
  '库房',
  '其他',
];

const APPROVED_PURPOSE_DETAIL_OPTIONS = [
  '基础化学实验室',
  '材料研发实验室',
  '行政办公室',
  '多媒体教室',
  '仪器库房',
  '会议室',
  '学生活动室',
  '其他',
];

const PURPOSE_SUBTYPE_OPTIONS = [
  '无',
  '材料研发实验室',
  '有机合成实验室',
  '仪器库房',
  '多媒体教室',
  '行政办公辅助用房',
  '其他',
];

// 构建初始数据行（从MOCK数据派生）
const buildDerivedRows = (): RoomUsageRow[] => {
  const personByRoomId = new Map<string, { personName: string; phone?: string; department?: string }>();
  MOCK_PERSON_ROOM_RELATIONS.forEach(r => {
    // 同一房间多人时取第一条作为责任人
    if (!personByRoomId.has(r.roomId)) {
      personByRoomId.set(r.roomId, { personName: r.personName, department: r.department });
    }
  });

  const changeByKey = new Map<string, { approvalNo: string; changeDate: string }>();
  MOCK_ROOM_CHANGE_REQUESTS.forEach(cr => {
    if (cr.status !== 'Approved') return;
    const date = cr.approvedAt || cr.createdAt;
    cr.sourceRooms.forEach(sr => {
      changeByKey.set(sr, { approvalNo: `变更申请:${cr.id}`, changeDate: date });
    });
  });

  MOCK_ROOM_TRANSFER_RECORDS.forEach(tr => {
    if (tr.status !== 'Completed') return;
    const key = `${tr.buildingName}-${tr.roomNo}`;
    changeByKey.set(key, { approvalNo: `移交记录:${tr.id}`, changeDate: tr.transferDate });
  });

  return MOCK_AVAILABLE_ROOMS.map((r, idx) => {
    const roomId = `RM-${r.roomNo}`;
    const approvedPurpose = getUseTypeLabel(r.useType);
    const approvedPurposeDetail = mapApprovedPurposeDetail(r.useType);
    // 实际用途：可分配状态时为待核查，否则默认与核定用途一致
    const actualPurpose = r.availability === 'Available' ? '待核查' : approvedPurpose;
    const complianceStatus = computeComplianceStatus(approvedPurpose, actualPurpose);
    const key = `${r.buildingName}-${r.roomNo}`;
    const change = changeByKey.get(key);
    const owner = personByRoomId.get(roomId);
    const deptAndOwner = `${r.lastDepartment || owner?.department || '待确认'} / ${owner?.personName || '待确认'}`;

    return {
      id: String(idx + 1),
      roomId,
      building: r.buildingName,
      floor: toFloorLabel(r.floor),
      roomNo: r.roomNo,
      buildingArea: r.area,
      approvedPurpose,
      approvedPurposeDetail,
      actualPurpose,
      purposeSubType: r.notes || '无',
      changeRecord: change
        ? { hasChange: true, approvalNo: change.approvalNo, changeDate: change.changeDate }
        : { hasChange: false, approvalNo: '无', changeDate: '无' },
      deptAndOwner,
      phone: owner?.phone || '待确认',
      complianceStatus,
      idleInfo: computeIdleInfo(r.availability, r.vacantSince),
      remark: r.notes || '',
    };
  });
};

// 编辑/新增模态框组件
const RoomUsageFormModal: React.FC<{
  initialData?: Partial<RoomUsageFormData> | null;
  onSave: (data: RoomUsageFormData) => void;
  onClose: () => void;
  isOpen: boolean;
}> = ({ initialData, onSave, onClose, isOpen }) => {
  const safeInitialData = initialData || {};
  const [formData, setFormData] = useState<RoomUsageFormData>({
    roomId: '',
    building: '',
    floor: '',
    roomNo: '',
    buildingArea: 0,
    approvedPurpose: '',
    approvedPurposeDetail: '',
    actualPurpose: '',
    purposeSubType: '无',
    changeRecord: { hasChange: false, approvalNo: '无', changeDate: '无' },
    deptAndOwner: '',
    phone: '',
    idleInfo: '否',
    remark: '',
    ...safeInitialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {safeInitialData.id ? '编辑房间用途' : '新增房间用途'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基础信息 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">楼栋</label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">楼层</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">房间号</label>
              <input
                type="text"
                value={formData.roomNo}
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">建筑面积 (㎡)</label>
              <input
                type="number"
                value={formData.buildingArea}
                onChange={(e) => setFormData({ ...formData, buildingArea: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* 用途信息 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">核定用途</label>
              <select
                value={formData.approvedPurpose}
                onChange={(e) => setFormData({ ...formData, approvedPurpose: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">请选择</option>
                {APPROVED_PURPOSE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">学校审批的合规用途</label>
              <select
                value={formData.approvedPurposeDetail}
                onChange={(e) => setFormData({ ...formData, approvedPurposeDetail: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">请选择</option>
                {APPROVED_PURPOSE_DETAIL_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">实际用途</label>
              <input
                type="text"
                value={formData.actualPurpose}
                onChange={(e) => setFormData({ ...formData, actualPurpose: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">用途细分类型</label>
              <select
                value={formData.purposeSubType}
                onChange={(e) => setFormData({ ...formData, purposeSubType: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {PURPOSE_SUBTYPE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* 附加信息 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">占用部门 / 责任人</label>
              <input
                type="text"
                value={formData.deptAndOwner}
                onChange={(e) => setFormData({ ...formData, deptAndOwner: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">联系电话</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">闲置情况</label>
              <input
                type="text"
                value={formData.idleInfo}
                onChange={(e) => setFormData({ ...formData, idleInfo: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">备注</label>
              <textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 组件属性接口
export interface PublicHouseRoomUsageQueryProps {
  keyword: string;
}

// 主组件
const PublicHouseRoomUsageQuery: React.FC<PublicHouseRoomUsageQueryProps> = ({ keyword }) => {
  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 数据存储（本地存储持久化）
  const [rows, setRows] = useLocalStorage<RoomUsageRow[]>(STORAGE_KEY, buildDerivedRows());

  // 当前编辑行
  const editingRow = useMemo(() =>
    editingId ? rows.find(row => row.id === editingId) : null
  , [editingId, rows]);

  // 保存操作（新增/编辑）
  const handleSave = (formData: RoomUsageFormData) => {
    const complianceStatus = computeComplianceStatus(
      formData.approvedPurpose,
      formData.actualPurpose
    );

    const newRow: RoomUsageRow = {
      ...formData,
      id: formData.id || generateId(), // 新增时生成唯一ID
      roomId: formData.roomId || `RM-${formData.roomNo}`, // 自动生成房间编号
      complianceStatus,
      // 编辑时自动添加变更记录
      changeRecord: formData.id
        ? {
            hasChange: true,
            approvalNo: `系统更新-${new Date().toISOString().split('T')[0]}`,
            changeDate: new Date().toISOString().split('T')[0]
          }
        : formData.changeRecord
    };

    if (editingId) {
      // 编辑现有行
      setRows(rows.map(row => row.id === editingId ? newRow : row));
    } else {
      // 新增行
      setRows([...rows, newRow]);
    }

    // 关闭模态框
    setIsModalOpen(false);
    setEditingId(null);
  };

  // 删除操作
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  // 打开编辑模态框
  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  // 打开新增模态框
  const handleAddNew = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  // 搜索过滤
  const filteredRows = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r =>
      r.roomId.toLowerCase().includes(k) ||
      r.building.toLowerCase().includes(k) ||
      r.roomNo.toLowerCase().includes(k) ||
      r.approvedPurpose.toLowerCase().includes(k) ||
      r.actualPurpose.toLowerCase().includes(k) ||
      r.deptAndOwner.toLowerCase().includes(k)
    );
  }, [keyword, rows]);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* 头部（标题+新增按钮） */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#1f2329]">公用房查询（按房间维度）</h3>
          <p className="text-sm text-[#646a73] mt-1">支持房间用途的增删改查与合规性管理</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} /> 新增记录
        </button>
      </div>

      {/* 编辑/新增模态框 */}
      <RoomUsageFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        initialData={editingRow}
        onSave={handleSave}
      />

      {/* 表格区域 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">序号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房间编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">楼栋 / 楼层 / 房间号</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">建筑面积（㎡）</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">核定用途</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">实际用途</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">
                  {row.roomId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.building} / {row.floor} / {row.roomNo}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {formatArea(row.buildingArea)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium">{row.approvedPurpose}</div>
                  <div className="text-xs text-gray-500">{row.approvedPurposeDetail}</div>
                  <div className="text-xs text-gray-500">{row.purposeSubType}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`${row.complianceStatus === '擅自变更（实际≠核定）' ? 'text-red-600 font-medium' : ''}`}>
                    {row.actualPurpose}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusBadgeClass(row.complianceStatus)}`}>
                    {row.complianceStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicHouseRoomUsageQuery;