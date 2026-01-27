import React from 'react';
import { UserRole } from '../types';
import HousingAllocation from './HousingAllocation';

const HousingAllocationAnalytics: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <HousingAllocation userRole={userRole} initialTab="analytics" hideTabNav />;
};

export default HousingAllocationAnalytics;
