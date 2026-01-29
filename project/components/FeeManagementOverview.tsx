import React from 'react';
import FeeManagement from './FeeManagement';
import { UserRole } from '../types';

const FeeManagementOverview: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <FeeManagement userRole={userRole} initialTab="overview" hideTabNav />;
};

export default FeeManagementOverview;



