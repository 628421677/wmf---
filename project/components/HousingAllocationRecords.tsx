import React from 'react';
import { UserRole } from '../types';
import HousingAllocation from './HousingAllocation';

const HousingAllocationRecords: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <HousingAllocation userRole={userRole} initialTab="history" hideTabNav />;
};

export default HousingAllocationRecords;
