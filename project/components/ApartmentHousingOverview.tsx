import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip } from 'recharts';

export type ApartmentRenewalStatus = '未续租' | '申请续租' | '续租审批通过';
export type ApartmentComplianceStatus = '完全合规' | '超期居住' | '擅自转租' | '欠缴费用';
export type ApartmentCheckoutStatus = '未退租' | '已退租';
export type ApartmentInspectionResult = '合格' | '需维修';

export interface ApartmentApplication {
  id: string;
  applicant: string;
  applicantId: string;
  department: string;
  phone: string;
  title: string;
  familyMembers: number;
  applyDate: string;
  expectedMoveInDate: string;
  reason: string;
  status: 'Draft' | 'PendingHR' | 'PendingAsset' | 'Approved' | 'Rejected' | 'CheckedIn' | 'CheckedOut';
  currentApprover?: string;
  approvalRecords: any[];
  allocatedRoomId?: string;
  allocatedRoomNo?: string;
  checkInDate?: string;
  checkOutDate?: string;
  utilitiesCost?: number;
  depositReturned?: boolean;
}

export interface ApartmentRoom {
  id: string;
  roomNo: string;
  building: string;
  floor: number;
  area: number;
  layout: string;
  facilities: string[];
  monthlyRent: number;
  deposit: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentTenant?: string;
  occupiedSince?: string;
}

export interface UtilityBill {
  id: string;
  roomId: string;
  roomNo: string;
  tenant: string;
  period: string;
  waterUsage: number;
  waterAmount: number;
  electricUsage: number;
  electricAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
  paidDate?: string;
}

export interface ApartmentHousingOverviewProps {
  apartmentRooms: ApartmentRoom[];
  apartmentApps: ApartmentApplication[];
  utilityBills: UtilityBill[];
}

interface ApartmentOverviewRow {
  id: string;
  apartmentId: string;
  location: string;
  area: number;
  livingCondition: string;
  tenantName: string;
  tenantId: string;
  departmentAndTalentType: string;
  coResidents: string;
  phone: string;
  approvalDocNo: string;
  allocationDate: string;
  leaseRange: string;
  renewalStatus: ApartmentRenewalStatus;
  rentStandard: number;
  utilitiesPaymentRule: string;
  complianceStatus: ApartmentComplianceStatus;
  checkoutInfo: string;
}

const toTalentType = (app: ApartmentApplication): string => {
  if (app.title.includes('教授')) return '省级高层次人才';
  if (app.title.includes('副教授')) return '青年教师';
  return '青年教师';
};

const computeRenewalStatus = (endDate?: string): ApartmentRenewalStatus => {
  if (!endDate) return '未续租';
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return '未续租';
  if (days <= 30) return '申请续租';
  return '未续租';
};

const computeComplianceStatus = (app: ApartmentApplication | undefined, unpaidUtility: boolean): ApartmentComplianceStatus => {
  if (unpaidUtility) return '欠缴费用';
  if (!app) return '完全合规';
  if (app.status === 'CheckedIn' && app.expectedMoveInDate && app.checkInDate) {
    // placeholder
  }
  return '完全合规';
};

const buildCheckoutInfo = (app?: ApartmentApplication): string => {
  if (!app) return '-';
  if (app.status !== 'CheckedOut') return '未退租';
  const date = app.checkOutDate || '-';
  const inspection: ApartmentInspectionResult = app.depositReturned ? '合格' : '需维修';
  return `已退租 / ${date} / ${inspection}`;
};

const ApartmentHousingOverview: React.FC<ApartmentHousingOverviewProps> = ({ apartmentRooms, apartmentApps, utilityBills }) => {
  const appsByRoomId = useMemo(() => {
    const m = new Map<string, ApartmentApplication>();
    apartmentApps.forEach(a => {
      if (a.allocatedRoomId) m.set(a.allocatedRoomId, a);
    });
    return m;
  }, [apartmentApps]);

  const unpaidByRoomId = useMemo(() => {
    const m = new Map<string, boolean>();
    utilityBills.forEach(b => {
      if (b.status === 'Unpaid') m.set(b.roomId, true);
    });
    return m;
  }, [utilityBills]);

  const rows = useMemo<ApartmentOverviewRow[]>(() => {
    const totalLeaseMonths = 12;

    return apartmentRooms.map(room => {
      const app = appsByRoomId.get(room.id);
      const unpaid = unpaidByRoomId.get(room.id) || false;

      const allocationDate = app?.checkInDate || room.occupiedSince || '';
      const leaseStart = allocationDate;
      const leaseEnd = allocationDate ? new Date(new Date(allocationDate).setMonth(new Date(allocationDate).getMonth() + totalLeaseMonths)).toISOString().split('T')[0] : '';
      const leaseRange = leaseStart && leaseEnd ? `${leaseStart} ~ ${leaseEnd}` : '';

      const livingCondition = `${room.layout} / 独立厨卫 / ${room.facilities.length > 0 ? '带家具家电' : '基础配置'}`;
      const departmentAndTalentType = app ? `${app.department} / ${toTalentType(app)} / ${app.title}` : '-';
      const coResidents = app ? `同住 ${Math.max(0, app.familyMembers - 1)} 人` : '-';

      return {
        id: room.id,
        apartmentId: room.roomNo,
        location: `${room.building} / ${room.floor}层 / ${room.roomNo}`,
        area: room.area,
        livingCondition,
        tenantName: room.currentTenant || app?.applicant || '-',
        tenantId: app?.applicantId || '-',
        departmentAndTalentType,
        coResidents,
        phone: app?.phone || '-',
        approvalDocNo: app ? `APT-APPROVAL-${app.id}` : '-',
        allocationDate: allocationDate || '-',
        leaseRange: leaseRange || '-',
        renewalStatus: computeRenewalStatus(leaseEnd),
        rentStandard: room.monthlyRent,
        utilitiesPaymentRule: '按月代扣 / 自行缴纳',
        complianceStatus: computeComplianceStatus(app, unpaid),
        checkoutInfo: buildCheckoutInfo(app),
      };
    });
  }, [apartmentRooms, appsByRoomId, unpaidByRoomId]);

  const roomStatusData = useMemo(() => [
    { name: '已入住', value: apartmentRooms.filter(r => r.status === 'Occupied').length, color: '#22c55e' },
    { name: '空置', value: apartmentRooms.filter(r => r.status === 'Available').length, color: '#3b82f6' },
    { name: '维修中', value: apartmentRooms.filter(r => r.status === 'Maintenance').length, color: '#f59e0b' },
    { name: '已预订', value: apartmentRooms.filter(r => r.status === 'Reserved').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0), [apartmentRooms]);

  return (
    <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-[#1f2329]">教师公寓周转房总览（台账）</h3>
        <p className="text-sm text-[#646a73] mt-1">字段可逐步对接分配审批、人才引进信息、水电缴费与验收记录。</p>
      </div>

      <div className="p-4 border-b">
        <h4 className="font-medium text-[#1f2329] mb-4">房源状态分布</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={roomStatusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {roomStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[#646a73]">
            <tr>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">序号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">周转房编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">楼栋 / 楼层 / 房间号</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">建筑面积（㎡）</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">房屋户型 / 配套设施</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">入住人姓名</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">入住人编号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">所属部门 / 人才引进类型</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">同住人信息</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">联系电话</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">分配审批单号</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">分配日期</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">租期起止日期</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">续租状态</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">租金标准（元 / 月）</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">水电气网费用缴纳方式</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">合规状态</th>
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">退租情况</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#1f2329]">{row.apartmentId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.location}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.area}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.livingCondition}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.tenantName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.tenantId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.departmentAndTalentType}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.coResidents}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.phone}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.approvalDocNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.allocationDate}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.leaseRange}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.renewalStatus}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{row.rentStandard.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.utilitiesPaymentRule}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.complianceStatus}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.checkoutInfo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApartmentHousingOverview;


