import React from 'react';
import MaintenanceEnhanced from './MaintenanceEnhanced';
import { UserRole } from '../types';

const MaintenanceProperty: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return (
    <MaintenanceEnhanced
      userRole={userRole}
      initialTab="property"
      hideTabNav
      pageTitle="维修与物业服务"
      pageSubtitle="在线报修、智能派单、服务申请、统计分析"
    />
  );
};

export default MaintenanceProperty;












