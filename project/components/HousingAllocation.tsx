import React, { useState, useMemo } from 'react';
import {
  MapPin, Users, Building, ArrowRight, CheckCircle2, Plus, X, AlertTriangle, Ban,
  Search, Filter, Eye, FileText, Clock, ChevronDown, ChevronRight, Home,
  RotateCcw, Calendar, Phone, Paperclip, MessageSquare, TrendingDown, TrendingUp,
  CheckCircle, XCircle, ArrowLeftRight, History, Layers, AlertCircle, Download,
  Printer, BarChart3, PieChart, Map, Bell, RefreshCw
} from 'lucide-react';
import {
  MOCK_FEES, MOCK_AVAILABLE_ROOMS,
  MOCK_EXTENDED_REQUESTS, MOCK_ALLOCATION_RECORDS, MOCK_RETURN_REQUESTS, MOCK_TEMPORARY_BORROWS
} from '../constants';
import {
  AllocationStatus, UserRole, RoomAvailability, RoomUseType,
  AvailableRoom, ExtendedRoomRequest, AllocationRecord,
  RoomReturnRequest, TemporaryBorrow, ApprovalRecord
} from '../types';

interface HousingAllocationProps {
  userRole: UserRole;
}

// localStorage hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
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

// StatCard 组件
const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isUp: boolean };
}> = ({ icon, iconBg, iconColor, title, value, subtitle, trend }) => (
  <div className="bg-white rounded-lg border border-[#dee0e3] p-4">
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      {trend && (
        <span className={`text-xs flex items-center gap-1 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend.value}%
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-[#1f2329]">{value}</p>
      <p className="text-xs text-[#8f959e] mt-1">{title}</p>
      {subtitle && <p className="text-xs text-[#646a73] mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// 进度条组件
const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = 'bg-blue-500' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

type TabType = 'requests' | 'allocation' | 'returns' | 'history' | 'analytics';

const HousingAllocation: React.FC<HousingAllocationProps> = ({ userRole }) => {
  // 数据状态
  const [requests, setRequests] = useLocalStorage<ExtendedRoomRequest[]>('housing-requests-v2', MOCK_EXTENDED_REQUESTS);
  const [availableRooms, setAvailableRooms] = useLocalStorage<AvailableRoom[]>('available-rooms', MOCK_AVAILABLE_ROOMS);
  const [allocationRecords, setAllocationRecords] = useLocalStorage<AllocationRecord[]>('allocation-records-v2', MOCK_ALLOCATION_RECORDS);
  const [returnRequests, setReturnRequests] = useLocalStorage<RoomReturnRequest[]>('return-requests', MOCK_RETURN_REQUESTS);
  const [temporaryBorrows] = useState<TemporaryBorrow[]>(MOCK_TEMPORARY_BORROWS);

  // UI 状态
  const [activeTab, setActiveTab] = useState<TabType>('requests');

  // 房源编辑 / 分配
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AvailableRoom | null>(null);
  const [roomForm, setRoomForm] = useState({
    roomNo: '',
    buildingName: '',
    floor: 1,
    area: 0,
    useType: RoomUseType.Office as RoomUseType,
    availability: RoomAvailability.Available as RoomAvailability,
    facilities: [] as string[],
    facilityOther: '',
    vacantSince: '',
    assigneeType: 'department' as 'department' | 'person',
    assigneeName: '',
    phone: '',
    notes: '',
  });
  const [assigneeSearch, setAssigneeSearch] = useState('');

  // 通知（仅前端演示：记录到 localStorage 并 alert 提示）
  const [notificationLogs, setNotificationLogs] = useLocalStorage<any[]>('housing-allocation-notifications-v1', []);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ExtendedRoomRequest | null>(null);
  const [detailRequest, setDetailRequest] = useState<ExtendedRoomRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRoomsForAllocation, setSelectedRoomsForAllocation] = useState<string[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AllocationStatus | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [areaRangeFilter, setAreaRangeFilter] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [roomBuildingFilter, setRoomBuildingFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<RoomUseType | 'all'>('all');
  const [roomAvailabilityFilter, setRoomAvailabilityFilter] = useState<RoomAvailability | 'all'>('all');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

  // 用户部门
  const myDepartmentName = userRole === UserRole.CollegeAdmin ? '机械工程学院' : userRole === UserRole.Teacher ? '计算机科学与技术学院' : '资产处';
  const myFeeStatus = MOCK_FEES.find(f => f.departmentName === myDepartmentName);
  const isBlocked = myFeeStatus && !myFeeStatus.isPaid && myFeeStatus.excessCost > 0;
  const myQuota = undefined;

  // 统计数据
  const stats = useMemo(() => ({
    pendingApproval: requests.filter(r => [AllocationStatus.PendingLevel1, AllocationStatus.PendingLevel2, AllocationStatus.PendingLevel3].includes(r.status)).length,
    approved: requests.filter(r => r.status === AllocationStatus.Approved).length,
    availableRooms: availableRooms.filter(r => r.availability === RoomAvailability.Available).length,
    totalAvailableArea: availableRooms.filter(r => r.availability === RoomAvailability.Available).reduce((acc, r) => acc + r.area, 0),
    pendingReturns: returnRequests.filter(r => r.status === 'Pending').length,
    expiringBorrows: temporaryBorrows.filter(t => t.status === 'Active' && new Date(t.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
    totalRequests: requests.length,
    rejectedRequests: requests.filter(r => r.status === AllocationStatus.Rejected).length,
  }), [requests, availableRooms, returnRequests, temporaryBorrows]);

  // 筛选后的申请列表
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = r.department.includes(searchTerm) || r.id.includes(searchTerm) || r.reason.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchDept = userRole === UserRole.AssetAdmin || r.department === myDepartmentName;
      const matchDateStart = !dateRangeFilter.start || r.requestedDate >= dateRangeFilter.start;
      const matchDateEnd = !dateRangeFilter.end || r.requestedDate <= dateRangeFilter.end;
      const matchAreaMin = !areaRangeFilter.min || r.area >= Number(areaRangeFilter.min);
      const matchAreaMax = !areaRangeFilter.max || r.area <= Number(areaRangeFilter.max);
      return matchSearch && matchStatus && matchDept && matchDateStart && matchDateEnd && matchAreaMin && matchAreaMax;
    });
  }, [requests, searchTerm, statusFilter, userRole, myDepartmentName, dateRangeFilter, areaRangeFilter]);

  // 筛选后的房源列表
  const filteredRooms = useMemo(() => {
    return availableRooms.filter(r => {
      const matchSearch = r.roomNo.includes(roomSearchTerm) || r.buildingName.includes(roomSearchTerm);
      const matchBuilding = roomBuildingFilter === 'all' || r.buildingName === roomBuildingFilter;
      const matchType = roomTypeFilter === 'all' || r.useType === roomTypeFilter;
      const matchAvailability = roomAvailabilityFilter === 'all' || r.availability === roomAvailabilityFilter;
      return matchSearch && matchBuilding && matchType && matchAvailability;
    });
  }, [availableRooms, roomSearchTerm, roomBuildingFilter, roomTypeFilter, roomAvailabilityFilter]);

  // 筛选后的历史记录
  const filteredHistory = useMemo(() => {
    return allocationRecords.filter(r => {
      const matchSearch = r.roomNo.includes(historySearchTerm) || r.buildingName.includes(historySearchTerm) || r.toDepartment.includes(historySearchTerm);
      const matchType = historyTypeFilter === 'all' || r.allocationType === historyTypeFilter;
      return matchSearch && matchType;
    });
  }, [allocationRecords, historySearchTerm, historyTypeFilter]);

  // 获取唯一的楼栋列表
  const buildings = useMemo(() => [...new Set(availableRooms.map(r => r.buildingName))], [availableRooms]);

  // 辅助函数
  const getStatusLabel = (status: AllocationStatus) => {
    const labels: Record<AllocationStatus, string> = {
      [AllocationStatus.Draft]: '草稿',
      [AllocationStatus.PendingLevel1]: '分管副校长审批中',
      [AllocationStatus.PendingLevel2]: '公用房领导小组审阅中',
      [AllocationStatus.PendingLevel3]: '校长办公会研究中',
      [AllocationStatus.Approved]: '已批准待配房',
      [AllocationStatus.Rejected]: '已驳回',
      [AllocationStatus.Allocated]: '已配房',
      [AllocationStatus.Completed]: '已完成',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: AllocationStatus) => {
    const colors: Record<AllocationStatus, string> = {
      [AllocationStatus.Draft]: 'bg-gray-100 text-gray-600',
      [AllocationStatus.PendingLevel1]: 'bg-amber-100 text-amber-700',
      [AllocationStatus.PendingLevel2]: 'bg-orange-100 text-orange-700',
      [AllocationStatus.PendingLevel3]: 'bg-red-100 text-red-700',
      [AllocationStatus.Approved]: 'bg-blue-100 text-blue-700',
      [AllocationStatus.Rejected]: 'bg-red-100 text-red-600',
      [AllocationStatus.Allocated]: 'bg-green-100 text-green-700',
      [AllocationStatus.Completed]: 'bg-green-100 text-green-600',
    };
    return colors[status] || '';
  };

  const getAvailabilityLabel = (a: RoomAvailability) => {
    const labels: Record<RoomAvailability, string> = {
      [RoomAvailability.Available]: '可分配',
      [RoomAvailability.Occupied]: '已占用',
      [RoomAvailability.Reserved]: '已预留',
      [RoomAvailability.Maintenance]: '维修中',
      [RoomAvailability.Pending]: '待腾退',
    };
    return labels[a];
  };

  const getAvailabilityColor = (a: RoomAvailability) => {
    const colors: Record<RoomAvailability, string> = {
      [RoomAvailability.Available]: 'bg-green-100 text-green-700',
      [RoomAvailability.Occupied]: 'bg-gray-100 text-gray-600',
      [RoomAvailability.Reserved]: 'bg-blue-100 text-blue-700',
      [RoomAvailability.Maintenance]: 'bg-orange-100 text-orange-700',
      [RoomAvailability.Pending]: 'bg-amber-100 text-amber-700',
    };
    return colors[a];
  };

  const getUseTypeLabel = (t: RoomUseType) => {
    const labels: Record<RoomUseType, string> = {
      [RoomUseType.Office]: '行政办公',
      [RoomUseType.Teaching]: '教学用房',
      [RoomUseType.Lab]: '科研实验室',
      [RoomUseType.Student]: '学生用房',
      [RoomUseType.Meeting]: '会议室',
      [RoomUseType.Storage]: '库房',
      [RoomUseType.Other]: '其他',
    };
    return labels[t];
  };

  const getAllocationTypeLabel = (t: string) => {
    const labels: Record<string, string> = {
      'New': '新分配',
      'Transfer': '调拨',
      'Return': '退还',
      'Adjust': '调整',
    };
    return labels[t] || t;
  };

  const getAllocationTypeColor = (t: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-green-100 text-green-700',
      'Transfer': 'bg-blue-100 text-blue-700',
      'Return': 'bg-amber-100 text-amber-700',
      'Adjust': 'bg-purple-100 text-purple-700',
    };
    return colors[t] || 'bg-gray-100 text-gray-600';
  };

  const getApprovalLevel = (area: number) => {
    if (area >= 1000) return 3;
    if (area >= 500) return 2;
    return 1;
  };

  // 审批操作
  const handleApprove = (req: ExtendedRoomRequest) => {
    const currentLevel = req.status === AllocationStatus.PendingLevel1 ? 1 : req.status === AllocationStatus.PendingLevel2 ? 2 : 3;
    const requiredLevel = getApprovalLevel(req.area);
    
    let nextStatus: AllocationStatus;
    let action: 'Approve' | 'Forward';
    
    if (currentLevel < requiredLevel) {
      nextStatus = currentLevel === 1 ? AllocationStatus.PendingLevel2 : AllocationStatus.PendingLevel3;
      action = 'Forward';
    } else {
      nextStatus = AllocationStatus.Approved;
      action = 'Approve';
    }

    const newRecord: ApprovalRecord = {
      id: `APR-${Date.now()}`,
      requestId: req.id,
      level: currentLevel,
      approverRole: currentLevel === 1 ? '分管副校长' : currentLevel === 2 ? '公用房领导小组' : '校长办公会',
      approverName: '当前用户',
      action,
      comment: action === 'Forward' ? '同意，转呈上级审批' : '同意',
      timestamp: new Date().toISOString(),
    };

    setRequests(prev => prev.map(r => r.id === req.id ? {
      ...r,
      status: nextStatus,
      approvalRecords: [...(r.approvalRecords || []), newRecord],
    } : r));
  };

  // 批量审批
  const handleBatchApprove = () => {
    const toApprove = requests.filter(r => selectedRequests.includes(r.id) && [AllocationStatus.PendingLevel1, AllocationStatus.PendingLevel2, AllocationStatus.PendingLevel3].includes(r.status));
    toApprove.forEach(req => handleApprove(req));
    setSelectedRequests([]);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason) return;
    const currentLevel = selectedRequest.status === AllocationStatus.PendingLevel1 ? 1 : selectedRequest.status === AllocationStatus.PendingLevel2 ? 2 : 3;
    
    const newRecord: ApprovalRecord = {
      id: `APR-${Date.now()}`,
      requestId: selectedRequest.id,
      level: currentLevel,
      approverRole: currentLevel === 1 ? '分管副校长' : currentLevel === 2 ? '公用房领导小组' : '校长办公会',
      approverName: '当前用户',
      action: 'Reject',
      comment: rejectReason,
      timestamp: new Date().toISOString(),
    };

    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
      ...r,
      status: AllocationStatus.Rejected,
      approvalRecords: [...(r.approvalRecords || []), newRecord],
    } : r));
    
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  // 配房操作（基于申请）
  const handleAllocate = () => {
    if (!selectedRequest || selectedRoomsForAllocation.length === 0) return;

    // 更新申请状态
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
      ...r,
      status: AllocationStatus.Allocated,
      allocatedRooms: selectedRoomsForAllocation,
    } : r));

    // 更新房源状态
    setAvailableRooms(prev => prev.map(room =>
      selectedRoomsForAllocation.includes(room.id)
        ? { ...room, availability: RoomAvailability.Occupied }
        : room
    ));

    // 写入调配记录
    const now = new Date();
    const effectiveDate = now.toISOString().split('T')[0];
    const newRecords: AllocationRecord[] = selectedRoomsForAllocation.map(roomId => {
      const room = availableRooms.find(r => r.id === roomId);
      return {
        id: `ALC-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        requestId: selectedRequest.id,
        roomId,
        roomNo: room?.roomNo || roomId,
        buildingName: room?.buildingName || '-',
        area: room?.area || 0,
        fromDepartment: room?.lastDepartment,
        toDepartment: selectedRequest.department,
        allocationType: 'New',
        effectiveDate,
        operator: '当前用户',
        notes: `申请配房：${getUseTypeLabel(selectedRequest.useType)}`,
      };
    });
    setAllocationRecords(prev => [...newRecords, ...prev]);

    // 通知（简单演示）
    const msg = `已为 ${selectedRequest.department} 配置房源：${newRecords.map(r => `${r.buildingName}${r.roomNo}`).join('、')}`;
    setNotificationLogs(prev => [{ id: `NTF-${Date.now()}`, type: 'Allocate', target: selectedRequest.department, content: msg, sentAt: now.toISOString() }, ...prev]);
    alert(msg);

    setIsAllocateModalOpen(false);
    setSelectedRequest(null);
    setSelectedRoomsForAllocation([]);
  };

  const openRoomModal = (room: AvailableRoom) => {
    const facilities = room.facilities || [];
    const other = facilities.find(f => f.startsWith('其他:'));
    const baseFacilities = facilities.filter(f => !f.startsWith('其他:'));

    setEditingRoom(room);
    setRoomForm({
      roomNo: room.roomNo,
      buildingName: room.buildingName,
      floor: room.floor,
      area: room.area,
      useType: room.useType,
      availability: room.availability,
      facilities: baseFacilities,
      facilityOther: other ? other.replace(/^其他:\s*/, '') : '',
      vacantSince: room.vacantSince || '',
      assigneeType: room.assigneePerson ? 'person' : 'department',
      assigneeName: room.assigneePerson || room.assigneeDept || room.lastDepartment || '',
      phone: room.phone || '',
      notes: room.notes || '',
    });
    setAssigneeSearch('');
    setIsRoomModalOpen(true);
  };

  const saveRoomOnly = () => {
    if (!editingRoom) return;

    const isNew = !availableRooms.some(r => r.id === editingRoom.id);

    const finalFacilities = [...roomForm.facilities];
    if (roomForm.facilityOther.trim()) {
      finalFacilities.push(`其他: ${roomForm.facilityOther.trim()}`);
    }

    const updated: AvailableRoom = {
      ...editingRoom,
      roomNo: roomForm.roomNo,
      buildingName: roomForm.buildingName,
      floor: Number(roomForm.floor),
      area: Number(roomForm.area),
      useType: roomForm.useType,
      availability: roomForm.availability,
      facilities: finalFacilities,
      vacantSince: roomForm.vacantSince || undefined,
      phone: roomForm.phone || undefined,
      notes: roomForm.notes || undefined,
    };

    setAvailableRooms(prev => (isNew ? [updated, ...prev] : prev.map(r => (r.id === editingRoom.id ? updated : r))));
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const saveAndAllocateRoom = () => {
    if (!editingRoom) return;
    if (!roomForm.assigneeName.trim()) return;

    const isNew = !availableRooms.some(r => r.id === editingRoom.id);

    const now = new Date();
    const effectiveDate = now.toISOString().split('T')[0];

    const finalFacilities = [...roomForm.facilities];
    if (roomForm.facilityOther.trim()) {
      finalFacilities.push(`其他: ${roomForm.facilityOther.trim()}`);
    }

    const isPerson = roomForm.assigneeType === 'person';
    const dept = isPerson ? '' : roomForm.assigneeName.trim();
    const person = isPerson ? roomForm.assigneeName.trim() : '';

    const updated: AvailableRoom = {
      ...editingRoom,
      roomNo: roomForm.roomNo,
      buildingName: roomForm.buildingName,
      floor: Number(roomForm.floor),
      area: Number(roomForm.area),
      useType: roomForm.useType,
      availability: roomForm.availability,
      facilities: finalFacilities,
      vacantSince: roomForm.vacantSince || undefined,
      lastDepartment: dept || editingRoom.lastDepartment,
      assigneeDept: dept || undefined,
      assigneePerson: person || undefined,
      phone: roomForm.phone || undefined,
      notes: roomForm.notes || undefined,
    };

    setAvailableRooms(prev => (isNew ? [updated, ...prev] : prev.map(r => (r.id === editingRoom.id ? updated : r))));

    const toDepartment = dept || person || '-';
    const newRecord: AllocationRecord = {
      id: `ALC-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      roomId: editingRoom.id,
      roomNo: updated.roomNo,
      buildingName: updated.buildingName,
      area: updated.area,
      fromDepartment: editingRoom.lastDepartment,
      toDepartment,
      allocationType: 'New',
      effectiveDate,
      operator: '当前用户',
      notes: [
        isPerson ? `接收人：${person}` : '',
        `类型：${getUseTypeLabel(updated.useType)}`,
        `状态：${getAvailabilityLabel(updated.availability)}`,
        roomForm.notes?.trim() ? `备注：${roomForm.notes.trim()}` : '',
      ].filter(Boolean).join('；'),
    };

    setAllocationRecords(prev => [newRecord, ...prev]);

    const targetLabel = isPerson ? person : dept;
    const msg = `已分配房源给 ${targetLabel}：${updated.buildingName}${updated.roomNo}`;
    setNotificationLogs(prev => [{ id: `NTF-${Date.now()}`, type: 'DirectAllocate', target: targetLabel, content: msg, sentAt: now.toISOString() }, ...prev]);
    alert(msg);

    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  // 新建申请
  const [newRequest, setNewRequest] = useState({
    area: '',
    reason: '',
    useType: RoomUseType.Office,
    urgency: 'Normal' as 'Normal' | 'Urgent',
    expectedDate: '',
    phone: '',
  });

  const handleSubmitNewRequest = () => {
    if (!newRequest.area || !newRequest.reason) return;
    const areaNum = Number(newRequest.area);
    
    const request: ExtendedRoomRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      department: myDepartmentName,
      applicant: '当前用户',
      applicantPhone: newRequest.phone,
      area: areaNum,
      reason: newRequest.reason,
      useType: newRequest.useType,
      urgency: newRequest.urgency,
      status: AllocationStatus.PendingLevel1,
      requestedDate: new Date().toISOString().split('T')[0],
      expectedDate: newRequest.expectedDate || undefined,
      currentQuota: myQuota?.remainingQuota,
      isOverQuota: myQuota ? areaNum > myQuota.remainingQuota : false,
      approvalRecords: [{
        id: `APR-${Date.now()}`,
        requestId: '',
        level: 0,
        approverRole: '申请人',
        approverName: '当前用户',
        action: 'Approve',
        comment: '提交申请',
        timestamp: new Date().toISOString(),
      }],
    };

    setRequests(prev => [request, ...prev]);
    setIsNewRequestModalOpen(false);
    setNewRequest({ area: '', reason: '', useType: RoomUseType.Office, urgency: 'Normal', expectedDate: '', phone: '' });
  };

  // 退房申请
  const [newReturn, setNewReturn] = useState({ roomNo: '', buildingName: '', area: '', reason: '', expectedDate: '' });

  const handleSubmitReturn = () => {
    if (!newReturn.roomNo || !newReturn.reason) return;
    const ret: RoomReturnRequest = {
      id: `RET-${Date.now().toString().slice(-6)}`,
      department: myDepartmentName,
      applicant: '当前用户',
      roomId: `RM-${newReturn.roomNo}`,
      roomNo: newReturn.roomNo,
      buildingName: newReturn.buildingName,
      area: Number(newReturn.area) || 0,
      reason: newReturn.reason,
      expectedReturnDate: newReturn.expectedDate,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReturnRequests(prev => [ret, ...prev]);
    setIsReturnModalOpen(false);
    setNewReturn({ roomNo: '', buildingName: '', area: '', reason: '', expectedDate: '' });
  };

  // 审批退房
  const handleApproveReturn = (ret: RoomReturnRequest) => {
    setReturnRequests(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'Approved', approvedAt: new Date().toISOString().split('T')[0] } : r));
  };

  const handleCompleteReturn = (ret: RoomReturnRequest) => {
    setReturnRequests(prev => prev.map(r => r.id === ret.id ? { ...r, status: 'Completed', completedAt: new Date().toISOString().split('T')[0] } : r));
    // 更新房源状态为可分配
    setAvailableRooms(prev => prev.map(room => 
      room.roomNo === ret.roomNo && room.buildingName === ret.buildingName
        ? { ...room, availability: RoomAvailability.Available, vacantSince: new Date().toISOString().split('T')[0] }
        : room
    ));
  };

  // 导出功能
  const handleExport = (type: 'requests' | 'rooms' | 'history') => {
    let data: any[] = [];
    let filename = '';
    
    if (type === 'requests') {
      data = filteredRequests.map(r => ({
        申请编号: r.id,
        申请部门: r.department,
        申请人: r.applicant,
        申请面积: r.area,
        用途: getUseTypeLabel(r.useType),
        状态: getStatusLabel(r.status),
        申请日期: r.requestedDate,
      }));
      filename = '用房申请列表';
    } else if (type === 'rooms') {
      data = filteredRooms.map(r => ({
        房间号: r.roomNo,
        楼栋: r.buildingName,
        楼层: r.floor,
        面积: r.area,
        类型: getUseTypeLabel(r.useType),
        状态: getAvailabilityLabel(r.availability),
      }));
      filename = '房源分配列表';
    } else {
      data = filteredHistory.map(r => ({
        记录编号: r.id,
        房间号: r.roomNo,
        楼栋: r.buildingName,
        面积: r.area,
        类型: getAllocationTypeLabel(r.allocationType),
        接收部门: r.toDepartment,
        生效日期: r.effectiveDate,
      }));
      filename = '调配记录';
    }
    
    // 简单的CSV导出
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Tab 配置
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'requests', label: '用房管理', icon: <FileText size={16} />, badge: stats.pendingApproval },
    { id: 'allocation', label: '房源分配', icon: <Home size={16} />, badge: stats.availableRooms },
    { id: 'returns', label: '退房管理', icon: <RotateCcw size={16} />, badge: stats.pendingReturns },
    { id: 'history', label: '调配记录', icon: <History size={16} /> },
    { id: 'analytics', label: '数据分析', icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2329]">公用房归口调配管理</h2>
          <p className="text-[#646a73]">房源库存管理、定额核算、分级审批、可视化配房、退房管理全流程</p>
        </div>
        {(userRole === UserRole.CollegeAdmin || userRole === UserRole.Teacher) && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 border border-[#dee0e3] text-[#646a73] rounded-md flex items-center gap-2 text-sm hover:bg-[#f5f6f7]"
            >
              <RotateCcw size={16} /> 申请退房
            </button>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              disabled={isBlocked === true}
              className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${
                isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#3370ff] hover:bg-[#285cc9] text-white'
              }`}
            >
              {isBlocked ? <Ban size={16} /> : <Plus size={16} />}
              {isBlocked ? '权限已冻结' : '新增用房申请'}
            </button>
          </div>
        )}
      </div>

      {/* 欠费警告 */}
      {isBlocked && userRole === UserRole.CollegeAdmin && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
          <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-sm">您的申请权限已被冻结</p>
            <p className="text-xs mt-1">检测到本年度公用房使用费尚未结清，请在"公房收费管理"模块完成缴费后恢复权限。</p>
          </div>
        </div>
      )}

      {/* 预警提醒 */}
      {userRole === UserRole.AssetAdmin && stats.expiringBorrows > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-start gap-3">
          <Bell className="flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-bold text-sm">系统预警提醒</p>
            <div className="text-xs mt-1 space-y-1">
              {stats.expiringBorrows > 0 && <p>• {stats.expiringBorrows} 项临时借用将在30天内到期</p>}
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock size={20} />} iconBg="bg-amber-50" iconColor="text-amber-600" title="待审批申请" value={stats.pendingApproval} />
        <StatCard icon={<Home size={20} />} iconBg="bg-green-50" iconColor="text-green-600" title="可分配房源" value={`${stats.availableRooms}间 / ${stats.totalAvailableArea}m²`} />
        <StatCard icon={<Calendar size={20} />} iconBg="bg-blue-50" iconColor="text-blue-600" title="即将到期借用" value={stats.expiringBorrows} subtitle="30天内" />
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-[#dee0e3]">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === tab.id ? 'border-[#3370ff] text-[#3370ff]' : 'border-transparent text-[#646a73] hover:text-[#1f2329]'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#3370ff] text-white' : 'bg-[#f2f3f5] text-[#646a73]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
        {/* ========== 用房申请 Tab ========== */}
        {activeTab === 'requests' && (
          <div>
            {/* 筛选栏 */}
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                  <input
                    type="text"
                    placeholder="搜索申请编号、部门、用途..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as AllocationStatus | 'all')}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm focus:border-[#3370ff] outline-none"
                >
                  <option value="all">全部状态</option>
                  <option value={AllocationStatus.PendingLevel1}>分管副校长审批中</option>
                  <option value={AllocationStatus.PendingLevel2}>领导小组审阅中</option>
                  <option value={AllocationStatus.PendingLevel3}>校长办公会研究中</option>
                  <option value={AllocationStatus.Approved}>已批准待配房</option>
                  <option value={AllocationStatus.Allocated}>已配房</option>
                  <option value={AllocationStatus.Rejected}>已驳回</option>
                </select>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#646a73]">面积:</span>
                  <input type="number" placeholder="最小" value={areaRangeFilter.min} onChange={e => setAreaRangeFilter(p => ({ ...p, min: e.target.value }))} className="w-20 border border-[#dee0e3] rounded px-2 py-1 text-sm" />
                  <span>-</span>
                  <input type="number" placeholder="最大" value={areaRangeFilter.max} onChange={e => setAreaRangeFilter(p => ({ ...p, max: e.target.value }))} className="w-20 border border-[#dee0e3] rounded px-2 py-1 text-sm" />
                  <span>m²</span>
                </div>
              </div>
              {/* 批量操作 */}
              {userRole === UserRole.AssetAdmin && selectedRequests.length > 0 && (
                <div className="mt-3 flex items-center gap-3 pt-3 border-t border-[#dee0e3]">
                  <span className="text-sm text-[#646a73]">已选 {selectedRequests.length} 项</span>
                  <button onClick={handleBatchApprove} className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">批量通过</button>
                  <button onClick={() => setSelectedRequests([])} className="text-xs px-3 py-1 border border-[#dee0e3] rounded hover:bg-gray-50">取消选择</button>
                </div>
              )}
            </div>

            {/* 工具栏 */}
            <div className="px-4 py-2 border-b border-[#dee0e3] flex justify-between items-center bg-white">
              <span className="text-sm text-[#646a73]">共 {filteredRequests.length} 条记录</span>
              <div className="flex gap-2">
                <button onClick={() => handleExport('requests')} className="text-xs px-3 py-1.5 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 申请列表 */}
            <div className="divide-y divide-[#dee0e3]">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-[#8f959e]">暂无申请记录</div>
              ) : (
                filteredRequests.map(req => (
                  <div key={req.id} className="p-4 hover:bg-[#f9fafb] transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {userRole === UserRole.AssetAdmin && [AllocationStatus.PendingLevel1, AllocationStatus.PendingLevel2, AllocationStatus.PendingLevel3].includes(req.status) && (
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(req.id)}
                            onChange={e => setSelectedRequests(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-[#1f2329]">{req.department}</span>
                            <span className="text-xs text-[#8f959e]">{req.id}</span>
                            {req.urgency === 'Urgent' && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">加急</span>
                            )}
                            {req.isOverQuota && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-1">
                                <AlertTriangle size={10} /> 超定额
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#646a73] mb-2">{req.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-[#8f959e]">
                            <span className="flex items-center gap-1"><Layers size={12} /> {req.area} m²</span>
                            <span className="flex items-center gap-1"><Building size={12} /> {getUseTypeLabel(req.useType)}</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {req.requestedDate}</span>
                            {req.applicant && <span className="flex items-center gap-1"><Users size={12} /> {req.applicant}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </span>
                        <button
                          onClick={() => { setDetailRequest(req); setIsDetailModalOpen(true); }}
                          className="text-[#3370ff] hover:text-[#285cc9] p-1"
                          title="查看详情"
                        >
                          <Eye size={18} />
                        </button>
                        {/* 审批操作按钮 */}
                        {userRole === UserRole.AssetAdmin && [AllocationStatus.PendingLevel1, AllocationStatus.PendingLevel2, AllocationStatus.PendingLevel3].includes(req.status) && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(req)}
                              className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                            >
                              <CheckCircle size={12} /> {getApprovalLevel(req.area) > (req.status === AllocationStatus.PendingLevel1 ? 1 : req.status === AllocationStatus.PendingLevel2 ? 2 : 3) ? '转呈' : '通过'}
                            </button>
                            <button
                              onClick={() => { setSelectedRequest(req); setIsRejectModalOpen(true); }}
                              className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                            >
                              <XCircle size={12} /> 驳回
                            </button>
                          </div>
                        )}
                        {/* 配房按钮 */}
                        {userRole === UserRole.AssetAdmin && req.status === AllocationStatus.Approved && (
                          <button
                            onClick={() => { setSelectedRequest(req); setIsAllocateModalOpen(true); }}
                            className="text-xs px-3 py-1 bg-[#3370ff] text-white rounded hover:bg-[#285cc9] flex items-center gap-1"
                          >
                            <MapPin size={12} /> 配房
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== 房源分配 Tab ========== */}
        {activeTab === 'allocation' && (
          <div>
            {/* 筛选栏 */}
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                  <input
                    type="text"
                    placeholder="搜索房间号、楼栋..."
                    value={roomSearchTerm}
                    onChange={e => setRoomSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm focus:border-[#3370ff] outline-none"
                  />
                </div>
                <select
                  value={roomBuildingFilter}
                  onChange={e => setRoomBuildingFilter(e.target.value)}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部楼栋</option>
                  {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                  value={roomTypeFilter}
                  onChange={e => setRoomTypeFilter(e.target.value as RoomUseType | 'all')}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部类型</option>
                  {Object.values(RoomUseType).map(t => <option key={t} value={t}>{getUseTypeLabel(t)}</option>)}
                </select>
                <select
                  value={roomAvailabilityFilter}
                  onChange={e => setRoomAvailabilityFilter(e.target.value as RoomAvailability | 'all')}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部状态</option>
                  {Object.values(RoomAvailability).map(a => <option key={a} value={a}>{getAvailabilityLabel(a)}</option>)}
                </select>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="px-4 py-2 border-b border-[#dee0e3] flex justify-between items-center">
              <span className="text-sm text-[#646a73]">共 {filteredRooms.length} 间房源</span>
              <div className="flex gap-2">
                {userRole === UserRole.AssetAdmin && (
                  <button
                    onClick={() => {
                      const room: AvailableRoom = {
                        id: `RM-${Date.now()}`,
                        roomNo: '',
                        buildingId: 'BLD-NEW',
                        buildingName: '',
                        floor: 1,
                        area: 0,
                        useType: RoomUseType.Office,
                        availability: RoomAvailability.Available,
                        facilities: [],
                        vacantSince: '',
                        notes: '',
                      };
                      setEditingRoom(room);
                      setRoomForm({
                        roomNo: room.roomNo,
                        buildingName: room.buildingName,
                        floor: room.floor,
                        area: room.area,
                        useType: room.useType,
                        availability: room.availability,
                        facilities: [],
                        facilityOther: '',
                        vacantSince: room.vacantSince || '',
                        assigneeType: 'department',
                        assigneeName: '',
                        phone: '',
                        notes: '',
                      });
                      setAssigneeSearch('');
                      setIsRoomModalOpen(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-[#3370ff] text-white rounded flex items-center gap-1 hover:bg-[#285cc9]"
                  >
                    <Plus size={14} /> 新增
                  </button>
                )}
                <button onClick={() => handleExport('rooms')} className="text-xs px-3 py-1.5 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 房源列表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f6f7] text-[#646a73]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">房间号</th>
                    <th className="px-4 py-3 text-left font-medium">楼栋</th>
                    <th className="px-4 py-3 text-left font-medium">楼层</th>
                    <th className="px-4 py-3 text-left font-medium">面积(m²)</th>
                    <th className="px-4 py-3 text-left font-medium">类型</th>
                    <th className="px-4 py-3 text-left font-medium">状态</th>
                    <th className="px-4 py-3 text-left font-medium">设施</th>
                    <th className="px-4 py-3 text-left font-medium">空置时间</th>
                    <th className="px-4 py-3 text-left font-medium">备注</th>
                    <th className="px-4 py-3 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee0e3]">
                  {filteredRooms.map(room => (
                    <tr key={room.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 font-medium text-[#1f2329]">{room.roomNo}</td>
                      <td className="px-4 py-3">{room.buildingName}</td>
                      <td className="px-4 py-3">{room.floor > 0 ? `${room.floor}F` : `B${Math.abs(room.floor)}`}</td>
                      <td className="px-4 py-3">{room.area}</td>
                      <td className="px-4 py-3">{getUseTypeLabel(room.useType)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${getAvailabilityColor(room.availability)}`}>
                          {getAvailabilityLabel(room.availability)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#646a73]">{room.facilities?.join(', ') || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[#8f959e]">{room.vacantSince || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[#8f959e]">{room.notes || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {userRole === UserRole.AssetAdmin && (
                          <button
                            onClick={() => openRoomModal(room)}
                            className="text-xs text-[#3370ff] hover:underline"
                          >
                            编辑/分配
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== 退房管理 Tab ========== */}
        {activeTab === 'returns' && (
          <div>
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <h3 className="font-medium text-[#1f2329]">退房申请列表</h3>
            </div>
            <div className="divide-y divide-[#dee0e3]">
              {returnRequests.length === 0 ? (
                <div className="p-8 text-center text-[#8f959e]">暂无退房申请</div>
              ) : (
                returnRequests.map(ret => (
                  <div key={ret.id} className="p-4 hover:bg-[#f9fafb]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-[#1f2329]">{ret.department}</span>
                          <span className="text-xs text-[#8f959e]">{ret.id}</span>
                        </div>
                        <p className="text-sm text-[#646a73] mb-2">
                          退还房间: {ret.buildingName} {ret.roomNo} ({ret.area}m²)
                        </p>
                        <p className="text-sm text-[#646a73] mb-2">原因: {ret.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-[#8f959e]">
                          <span>申请人: {ret.applicant}</span>
                          <span>申请日期: {ret.createdAt}</span>
                          <span>预计退还: {ret.expectedReturnDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          ret.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          ret.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {ret.status === 'Pending' ? '待审批' : ret.status === 'Approved' ? '已批准' : '已完成'}
                        </span>
                        {userRole === UserRole.AssetAdmin && ret.status === 'Pending' && (
                          <button
                            onClick={() => handleApproveReturn(ret)}
                            className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            批准
                          </button>
                        )}
                        {userRole === UserRole.AssetAdmin && ret.status === 'Approved' && (
                          <button
                            onClick={() => handleCompleteReturn(ret)}
                            className="text-xs px-3 py-1 bg-[#3370ff] text-white rounded hover:bg-[#285cc9]"
                          >
                            确认退还
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 临时借用到期提醒 */}
            {temporaryBorrows.filter(t => t.status === 'Active').length > 0 && (
              <div className="border-t border-[#dee0e3]">
                <div className="p-4 bg-[#fcfcfd]">
                  <h3 className="font-medium text-[#1f2329]">临时借用情况</h3>
                </div>
                <div className="divide-y divide-[#dee0e3]">
                  {temporaryBorrows.filter(t => t.status === 'Active').map(tb => {
                    const daysLeft = Math.ceil((new Date(tb.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiring = daysLeft <= 30;
                    return (
                      <div key={tb.id} className="p-4 hover:bg-[#f9fafb]">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-[#1f2329]">{tb.buildingName} {tb.roomNo}</p>
                            <p className="text-sm text-[#646a73]">{tb.borrowerDept} 借用自 {tb.ownerDept}</p>
                            <p className="text-xs text-[#8f959e] mt-1">{tb.startDate} ~ {tb.endDate}</p>
                          </div>
                          <div className="text-right">
                            {isExpiring ? (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded flex items-center gap-1">
                                <AlertTriangle size={10} /> {daysLeft}天后到期
                              </span>
                            ) : (
                              <span className="text-xs text-[#8f959e]">剩余 {daysLeft} 天</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== 调配记录 Tab ========== */}
        {activeTab === 'history' && (
          <div>
            {/* 筛选栏 */}
            <div className="p-4 border-b border-[#dee0e3] bg-[#fcfcfd]">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f959e]" />
                  <input
                    type="text"
                    placeholder="搜索房间号、楼栋、部门..."
                    value={historySearchTerm}
                    onChange={e => setHistorySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#dee0e3] rounded-md text-sm"
                  />
                </div>
                <select
                  value={historyTypeFilter}
                  onChange={e => setHistoryTypeFilter(e.target.value)}
                  className="border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部类型</option>
                  <option value="New">新分配</option>
                  <option value="Transfer">调拨</option>
                  <option value="Return">退还</option>
                  <option value="Adjust">调整</option>
                </select>
                <button onClick={() => handleExport('history')} className="text-xs px-3 py-1.5 border border-[#dee0e3] rounded flex items-center gap-1 hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 记录列表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f5f6f7] text-[#646a73]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">记录编号</th>
                    <th className="px-4 py-3 text-left font-medium">房间</th>
                    <th className="px-4 py-3 text-left font-medium">面积</th>
                    <th className="px-4 py-3 text-left font-medium">类型</th>
                    <th className="px-4 py-3 text-left font-medium">原单位</th>
                    <th className="px-4 py-3 text-left font-medium">接收单位</th>
                    <th className="px-4 py-3 text-left font-medium">生效日期</th>
                    <th className="px-4 py-3 text-left font-medium">操作人</th>
                    <th className="px-4 py-3 text-left font-medium">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee0e3]">
                  {filteredHistory.map(record => (
                    <tr key={record.id} className="hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 text-[#8f959e]">{record.id}</td>
                      <td className="px-4 py-3 font-medium text-[#1f2329]">{record.buildingName} {record.roomNo}</td>
                      <td className="px-4 py-3">{record.area}m²</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${getAllocationTypeColor(record.allocationType)}`}>
                          {getAllocationTypeLabel(record.allocationType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#646a73]">{record.fromDepartment || '-'}</td>
                      <td className="px-4 py-3">{record.toDepartment || '-'}</td>
                      <td className="px-4 py-3 text-[#8f959e]">{record.effectiveDate}</td>
                      <td className="px-4 py-3 text-[#646a73]">{record.operator}</td>
                      <td className="px-4 py-3 text-xs text-[#8f959e]">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== 数据分析 Tab ========== */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 申请统计 */}
              <div className="border border-[#dee0e3] rounded-lg p-4">
                <h3 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                  <PieChart size={18} /> 申请状态分布
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#646a73]">待审批</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.pendingApproval / stats.totalRequests) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{stats.pendingApproval}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#646a73]">已批准</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.approved / stats.totalRequests) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{stats.approved}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#646a73]">已驳回</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.rejectedRequests / stats.totalRequests) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{stats.rejectedRequests}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 房源统计 */}
              <div className="border border-[#dee0e3] rounded-lg p-4">
                <h3 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                  <Home size={18} /> 房源状态分布
                </h3>
                <div className="space-y-3">
                  {Object.values(RoomAvailability).map(status => {
                    const count = availableRooms.filter(r => r.availability === status).length;
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-[#646a73]">{getAvailabilityLabel(status)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${
                              status === RoomAvailability.Available ? 'bg-green-500' :
                              status === RoomAvailability.Occupied ? 'bg-gray-500' :
                              status === RoomAvailability.Reserved ? 'bg-blue-500' :
                              status === RoomAvailability.Maintenance ? 'bg-orange-500' : 'bg-amber-500'
                            }`} style={{ width: `${(count / availableRooms.length) * 100}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* 楼栋房源分布 */}
              <div className="border border-[#dee0e3] rounded-lg p-4">
                <h3 className="font-medium text-[#1f2329] mb-4 flex items-center gap-2">
                  <Building size={18} /> 楼栋房源分布
                </h3>
                <div className="space-y-3">
                  {buildings.map(building => {
                    const rooms = availableRooms.filter(r => r.buildingName === building);
                    const available = rooms.filter(r => r.availability === RoomAvailability.Available).length;
                    return (
                      <div key={building} className="flex justify-between items-center">
                        <span className="text-sm text-[#1f2329]">{building}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600">{available}可用</span>
                          <span className="text-xs text-[#8f959e]">/ {rooms.length}总</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== 模态框 ========== */}

      {/* 房源编辑/分配弹窗 */}
      {isRoomModalOpen && editingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setIsRoomModalOpen(false); setEditingRoom(null); }}>
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">房源编辑 / 分配</h3>
              <button onClick={() => { setIsRoomModalOpen(false); setEditingRoom(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">房间号 *</label>
                  <input className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.roomNo} onChange={e => setRoomForm(p => ({ ...p, roomNo: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">楼栋 *</label>
                  <input className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.buildingName} onChange={e => setRoomForm(p => ({ ...p, buildingName: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">楼层 *</label>
                  <input type="number" className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.floor} onChange={e => setRoomForm(p => ({ ...p, floor: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">面积(m²) *</label>
                  <input type="number" className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.area} onChange={e => setRoomForm(p => ({ ...p, area: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">类型</label>
                  <select className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.useType} onChange={e => setRoomForm(p => ({ ...p, useType: e.target.value as RoomUseType }))}>
                    {Object.values(RoomUseType).map(t => <option key={t} value={t}>{getUseTypeLabel(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">状态</label>
                  <select className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.availability} onChange={e => setRoomForm(p => ({ ...p, availability: e.target.value as RoomAvailability }))}>
                    {Object.values(RoomAvailability).map(a => <option key={a} value={a}>{getAvailabilityLabel(a)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-2">设施（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  {['空调', '桌椅', '投影', '白板', '网络', '其他'].map(f => {
                    const checked = roomForm.facilities.includes(f);
                    return (
                      <label key={f} className="text-sm flex items-center gap-2 border border-[#dee0e3] rounded px-2 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setRoomForm(p => ({ ...p, facilities: [...p.facilities, f] }));
                            } else {
                              setRoomForm(p => ({ ...p, facilities: p.facilities.filter(x => x !== f) }));
                            }
                          }}
                        />
                        <span>{f}</span>
                      </label>
                    );
                  })}
                </div>
                {roomForm.facilities.includes('其他') && (
                  <div className="mt-2">
                    <input
                      className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                      placeholder="请输入其他设施"
                      value={roomForm.facilityOther}
                      onChange={e => setRoomForm(p => ({ ...p, facilityOther: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">空置时间</label>
                  <input type="date" className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.vacantSince} onChange={e => setRoomForm(p => ({ ...p, vacantSince: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">联系电话</label>
                  <input className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm" value={roomForm.phone} onChange={e => setRoomForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-2">分配对象</label>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={roomForm.assigneeType === 'department'} onChange={() => setRoomForm(p => ({ ...p, assigneeType: 'department' }))} />
                      <span>部门</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={roomForm.assigneeType === 'person'} onChange={() => setRoomForm(p => ({ ...p, assigneeType: 'person' }))} />
                      <span>个人</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">人员/部门名称</label>
                  <input
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    value={roomForm.assigneeName}
                    onChange={e => setRoomForm(p => ({ ...p, assigneeName: e.target.value }))}
                    placeholder={roomForm.assigneeType === 'person' ? '请输入人员姓名' : '请输入部门名称'}
                  />
                  <div className="mt-2">
                    <input
                      className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                      placeholder="模糊搜索（仅辅助输入）"
                      value={assigneeSearch}
                      onChange={e => setAssigneeSearch(e.target.value)}
                    />
                    {assigneeSearch.trim() && (
                      <div className="mt-2 border border-[#dee0e3] rounded p-2 bg-[#fcfcfd] text-sm text-[#646a73]">
                        {[
                          ...new Set([
                            ...quotas.map(q => q.departmentName),
                            ...requests.map(r => r.department),
                            ...requests.map(r => r.applicant),
                          ])
                        ]
                          .filter(n => n.includes(assigneeSearch.trim()))
                          .slice(0, 6)
                          .map(n => (
                            <button
                              key={n}
                              className="block w-full text-left hover:bg-[#f5f6f7] rounded px-2 py-1"
                              onClick={() => { setRoomForm(p => ({ ...p, assigneeName: n })); setAssigneeSearch(''); }}
                              type="button"
                            >
                              {n}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">备注</label>
                <textarea className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-20" value={roomForm.notes} onChange={e => setRoomForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => { setIsRoomModalOpen(false); setEditingRoom(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">取消</button>
              {editingRoom && availableRooms.some(r => r.id === editingRoom.id) && (
                <button
                  onClick={() => {
                    if (!editingRoom) return;
                    if (!confirm('确定删除该房源？')) return;
                    const now = new Date();
                    setAvailableRooms(prev => prev.filter(r => r.id !== editingRoom.id));
                    const msg = `已删除房源：${editingRoom.buildingName}${editingRoom.roomNo}`;
                    setNotificationLogs(prev => [{ id: `NTF-${Date.now()}`, type: 'DeleteRoom', target: '房源', content: msg, sentAt: now.toISOString() }, ...prev]);
                    alert(msg);
                    setIsRoomModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
                >
                  删除
                </button>
              )}
              <button onClick={saveRoomOnly} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">仅保存</button>
              <button
                onClick={saveAndAllocateRoom}
                disabled={!roomForm.assigneeName.trim()}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                保存并分配
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 新建申请模态框 */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">新增用房申请</h3>
              <button onClick={() => setIsNewRequestModalOpen(false)} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">申请面积 (m²) *</label>
                <input
                  type="number"
                  value={newRequest.area}
                  onChange={e => setNewRequest(p => ({ ...p, area: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  placeholder="请输入申请面积"
                />
                {myQuota && (
                  <p className="text-xs text-[#8f959e] mt-1">
                    当前剩余定额: {myQuota.remainingQuota}m²
                    {Number(newRequest.area) > myQuota.remainingQuota && (
                      <span className="text-amber-600 ml-2">⚠ 超出定额，需更高级别审批</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">用途类型 *</label>
                <select
                  value={newRequest.useType}
                  onChange={e => setNewRequest(p => ({ ...p, useType: e.target.value as RoomUseType }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                >
                  {Object.values(RoomUseType).map(t => <option key={t} value={t}>{getUseTypeLabel(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">申请理由 *</label>
                <textarea
                  value={newRequest.reason}
                  onChange={e => setNewRequest(p => ({ ...p, reason: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-24"
                  placeholder="请详细说明申请用房的原因和用途"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">紧急程度</label>
                  <select
                    value={newRequest.urgency}
                    onChange={e => setNewRequest(p => ({ ...p, urgency: e.target.value as 'Normal' | 'Urgent' }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Normal">普通</option>
                    <option value="Urgent">加急</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">期望入住日期</label>
                  <input
                    type="date"
                    value={newRequest.expectedDate}
                    onChange={e => setNewRequest(p => ({ ...p, expectedDate: e.target.value }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">联系电话</label>
                <input
                  type="tel"
                  value={newRequest.phone}
                  onChange={e => setNewRequest(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  placeholder="请输入联系电话"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => setIsNewRequestModalOpen(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleSubmitNewRequest}
                disabled={!newRequest.area || !newRequest.reason}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 驳回模态框 */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">驳回申请</h3>
              <button onClick={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#646a73] mb-3">
                确定驳回 <span className="font-medium text-[#1f2329]">{selectedRequest.department}</span> 的用房申请？
              </p>
              <label className="block text-sm font-medium text-[#1f2329] mb-1">驳回原因 *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-24"
                placeholder="请输入驳回原因"
              />
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配房模态框 */}
      {isAllocateModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">配房 - {selectedRequest.department}</h3>
              <button onClick={() => { setIsAllocateModalOpen(false); setSelectedRequest(null); setSelectedRoomsForAllocation([]); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-[#f5f6f7] rounded-md p-3 mb-4">
                <p className="text-sm"><span className="text-[#646a73]">申请面积:</span> <span className="font-medium">{selectedRequest.area}m²</span></p>
                <p className="text-sm mt-1"><span className="text-[#646a73]">用途:</span> {getUseTypeLabel(selectedRequest.useType)}</p>
                <p className="text-sm mt-1"><span className="text-[#646a73]">已选面积:</span> <span className="font-medium text-[#3370ff]">{availableRooms.filter(r => selectedRoomsForAllocation.includes(r.id)).reduce((acc, r) => acc + r.area, 0)}m²</span></p>
              </div>
              
              <h4 className="font-medium text-sm mb-3">选择房源 (可多选)</h4>
              <div className="border border-[#dee0e3] rounded-md max-h-64 overflow-y-auto">
                {availableRooms.filter(r => r.availability === RoomAvailability.Available).map(room => (
                  <label key={room.id} className="flex items-center gap-3 p-3 hover:bg-[#f9fafb] cursor-pointer border-b border-[#dee0e3] last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selectedRoomsForAllocation.includes(room.id)}
                      onChange={e => setSelectedRoomsForAllocation(prev => e.target.checked ? [...prev, room.id] : prev.filter(id => id !== room.id))}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{room.buildingName} {room.roomNo}</p>
                      <p className="text-xs text-[#8f959e]">{room.floor > 0 ? `${room.floor}F` : `B${Math.abs(room.floor)}`} · {room.area}m² · {getUseTypeLabel(room.useType)}</p>
                    </div>
                    <span className="text-sm font-medium text-[#3370ff]">{room.area}m²</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => { setIsAllocateModalOpen(false); setSelectedRequest(null); setSelectedRoomsForAllocation([]); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleAllocate}
                disabled={selectedRoomsForAllocation.length === 0}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认配房
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退房申请模态框 */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">申请退房</h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">楼栋 *</label>
                  <select
                    value={newReturn.buildingName}
                    onChange={e => setNewReturn(p => ({ ...p, buildingName: e.target.value }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">请选择楼栋</option>
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1f2329] mb-1">房间号 *</label>
                  <input
                    type="text"
                    value={newReturn.roomNo}
                    onChange={e => setNewReturn(p => ({ ...p, roomNo: e.target.value }))}
                    className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                    placeholder="如: 301"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">面积 (m²)</label>
                <input
                  type="number"
                  value={newReturn.area}
                  onChange={e => setNewReturn(p => ({ ...p, area: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                  placeholder="请输入房间面积"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">退房原因 *</label>
                <textarea
                  value={newReturn.reason}
                  onChange={e => setNewReturn(p => ({ ...p, reason: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm h-20"
                  placeholder="请说明退房原因"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2329] mb-1">预计退还日期</label>
                <input
                  type="date"
                  value={newReturn.expectedDate}
                  onChange={e => setNewReturn(p => ({ ...p, expectedDate: e.target.value }))}
                  className="w-full border border-[#dee0e3] rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end gap-3">
              <button onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={!newReturn.roomNo || !newReturn.reason || !newReturn.buildingName}
                className="px-4 py-2 bg-[#3370ff] text-white rounded-md text-sm hover:bg-[#285cc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 申请详情模态框 */}
      {isDetailModalOpen && detailRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#dee0e3] flex justify-between items-center">
              <h3 className="font-medium text-lg">申请详情 - {detailRequest.id}</h3>
              <button onClick={() => { setIsDetailModalOpen(false); setDetailRequest(null); }} className="text-[#8f959e] hover:text-[#1f2329]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#8f959e]">申请部门</p>
                  <p className="font-medium">{detailRequest.department}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">申请人</p>
                  <p className="font-medium">{detailRequest.applicant}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">申请面积</p>
                  <p className="font-medium">{detailRequest.area} m²</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">用途类型</p>
                  <p className="font-medium">{getUseTypeLabel(detailRequest.useType)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">申请日期</p>
                  <p className="font-medium">{detailRequest.requestedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8f959e]">当前状态</p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(detailRequest.status)}`}>
                    {getStatusLabel(detailRequest.status)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-[#8f959e] mb-1">申请理由</p>
                <p className="text-sm bg-[#f5f6f7] rounded p-3">{detailRequest.reason}</p>
              </div>

              {/* 审批流程 */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <History size={16} /> 审批流程
                </h4>
                <div className="relative pl-6 border-l-2 border-[#dee0e3] space-y-4">
                  {detailRequest.approvalRecords?.map((record, index) => (
                    <div key={record.id} className="relative">
                      <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 ${
                        record.action === 'Approve' || record.action === 'Forward' ? 'bg-green-500 border-green-500' :
                        record.action === 'Reject' ? 'bg-red-500 border-red-500' : 'bg-gray-300 border-gray-300'
                      }`} />
                      <div className="bg-[#f9fafb] rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{record.approverRole}</p>
                            <p className="text-xs text-[#8f959e]">{record.approverName}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            record.action === 'Approve' ? 'bg-green-100 text-green-700' :
                            record.action === 'Forward' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {record.action === 'Approve' ? '通过' : record.action === 'Forward' ? '转呈' : '驳回'}
                          </span>
                        </div>
                        {record.comment && <p className="text-sm text-[#646a73] mt-2">{record.comment}</p>}
                        <p className="text-xs text-[#8f959e] mt-2">{new Date(record.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 已分配房间 */}
              {detailRequest.allocatedRooms && detailRequest.allocatedRooms.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <MapPin size={16} /> 已分配房间
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    {detailRequest.allocatedRooms.map(roomId => {
                      const room = availableRooms.find(r => r.id === roomId);
                      return room ? (
                        <p key={roomId} className="text-sm text-green-700">
                          {room.buildingName} {room.roomNo} ({room.area}m²)
                        </p>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* 附件 */}
              {detailRequest.attachments && detailRequest.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Paperclip size={16} /> 附件
                  </h4>
                  <div className="space-y-2">
                    {detailRequest.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#3370ff] hover:underline cursor-pointer">
                        <FileText size={14} /> {att}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#dee0e3] flex justify-end">
              <button onClick={() => { setIsDetailModalOpen(false); setDetailRequest(null); }} className="px-4 py-2 border border-[#dee0e3] rounded-md text-sm hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousingAllocation;
