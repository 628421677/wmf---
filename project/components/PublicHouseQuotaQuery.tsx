import React from 'react';
import PublicHouseComprehensiveQuery from './PublicHouseComprehensiveQuery';

const PublicHouseQuotaQuery: React.FC = () => {
  return (
    <PublicHouseComprehensiveQuery
      initialTab="quotaQuery"
      hideTabNav
      pageTitle="公房综合查询"
      pageSubtitle="面向公用房多维度查询与统计分析"
    />
  );
};

export default PublicHouseQuotaQuery;


