import React from 'react';
import { UserRole } from '../types';
import HousingAllocation from './HousingAllocation';

const HousingAllocationResource: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <HousingAllocation userRole={userRole} initialTab="allocation" hideTabNav />;
};

export default HousingAllocationResource;
