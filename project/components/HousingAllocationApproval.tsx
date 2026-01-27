import React from 'react';
import { UserRole } from '../types';
import HousingAllocation from './HousingAllocation';

const HousingAllocationApproval: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <HousingAllocation userRole={userRole} initialTab="requests" hideTabNav />;
};

export default HousingAllocationApproval;
