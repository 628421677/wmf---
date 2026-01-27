import React from 'react';
import { UserRole } from '../types';
import HousingAllocation from './HousingAllocation';

const HousingAllocationAdjust: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <HousingAllocation userRole={userRole} initialTab="returns" hideTabNav />;
};

export default HousingAllocationAdjust;
