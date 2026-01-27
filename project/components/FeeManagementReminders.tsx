import React from 'react';
import FeeManagement from './FeeManagement';
import { UserRole } from '../types';

const FeeManagementReminders: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <FeeManagement userRole={userRole} initialTab="reminders" hideTabNav />;
};

export default FeeManagementReminders;

