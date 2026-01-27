import React from 'react';
import CommercialHousing from './CommercialHousing';
import { UserRole } from '../types';

const CommercialManagementContracts: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return (
    <CommercialHousing
      userRole={userRole}
      initialMainTab="commercial"
      initialCommercialTab="contracts"
      hideMainTabNav
      hideSubTabNav
      pageTitle="经营性用房管理"
      pageSubtitle="租金收缴、合同管理、房源维护全流程"
    />
  );
};

export default CommercialManagementContracts;

