import React, { useEffect, useState } from 'react';
import ReportCenterEnhanced from './ReportCenterEnhanced';
import { UserRole } from '../types';

const ReportsLogsPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  // NOTE: ReportCenterEnhanced internally defaults to 'standard'. For now we reuse it as-is.
  // We'll switch to proper tab-specific pages in a follow-up refactor if needed.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ReportCenterEnhanced userRole={userRole} initialTab="logs" hideTabBar />;
};

export default ReportsLogsPage;

