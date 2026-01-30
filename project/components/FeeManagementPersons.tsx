import React from 'react';
import FeeManagement from './FeeManagement';
import { UserRole } from '../types';

const FeeManagementPersons: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <FeeManagement userRole={userRole} initialTab="persons" hideTabNav />;
};

export default FeeManagementPersons;












