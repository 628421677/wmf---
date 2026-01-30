import React from 'react';
import FeeManagement from './FeeManagement';
import { UserRole } from '../types';

const FeeManagementPayments: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <FeeManagement userRole={userRole} initialTab="payments" hideTabNav />;
};

export default FeeManagementPayments;









