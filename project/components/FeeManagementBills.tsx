import React from 'react';
import FeeManagement from './FeeManagement';
import { UserRole } from '../types';

const FeeManagementBills: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <FeeManagement userRole={userRole} initialTab="bills" hideTabNav />;
};

export default FeeManagementBills;



