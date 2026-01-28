import React from 'react';
import ReportCenterEnhanced from './ReportCenterEnhanced';
import { UserRole } from '../types';

const ReportsCustomPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <ReportCenterEnhanced userRole={userRole} initialTab="custom" hideTabBar />;
};

export default ReportsCustomPage;
