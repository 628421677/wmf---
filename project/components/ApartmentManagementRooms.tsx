import React from 'react';
import { UserRole } from '../types';
import ApartmentManagementRoomsPage from './ApartmentManagementRoomsPage';

const ApartmentManagementRooms: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <ApartmentManagementRoomsPage />;
};

export default ApartmentManagementRooms;
