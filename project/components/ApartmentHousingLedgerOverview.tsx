import React, { useMemo } from 'react';

export type ApartmentRenewalStatus = '未续租' | '申请续租' | '续租审批通过';
export type ApartmentComplianceStatus = '完全合规' | '超期居住' | '擅自转租' | '欠缴费用';

export interface ApartmentLedgerRow {
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

export interface ApartmentHousingLedgerOverviewProps {
  rows: ApartmentLedgerRow[];
  title?: string;
}

const ApartmentHousingLedgerOverview: React.FC<ApartmentHousingLedgerOverviewProps> = ({
  rows,
  title = '教师公寓周转房总览（台账）',
}) => {
  const safeRows = useMemo(() => rows ?? [], [rows]);

  return (
    <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-[#1f2329]">{title}</h3>
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
            {safeRows.map((row, idx) => (
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

export default ApartmentHousingLedgerOverview;




