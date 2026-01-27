import React from 'react';
import CommercialHousing from './CommercialHousing';
import { UserRole } from '../types';

const ApartmentManagementDeposits: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return (
    <CommercialHousing
      userRole={userRole}
      initialMainTab="apartment"
      initialApartmentTab="deposits"
      hideMainTabNav
      hideSubTabNav
      pageTitle="公寓与宿舍管理"
      pageSubtitle="入住申请、房间管理、水电结算、押金退还全流程"
    />
  );
};

export default ApartmentManagementDeposits;

