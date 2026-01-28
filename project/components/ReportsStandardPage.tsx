import React from 'react';
import ReportCenterEnhanced from './ReportCenterEnhanced';
import { UserRole } from '../types';

const ReportsStandardPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  return <ReportCenterEnhanced userRole={userRole} initialTab="standard" hideTabBar />;
};

export default ReportsStandardPage;

