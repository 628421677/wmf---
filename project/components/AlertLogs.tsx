import React from 'react';
import { MOCK_ALERTS } from '../constants';
import AlertItem from './Dashboard'; // 或者把 AlertItem 抽到独立文件

interface Props {
  onBack: () => void;
}

const AlertLogs: React.FC<Props> = ({ onBack }) => (
  <div className="space-y-6 animate-fade-in">
    <button onClick={onBack} className="text-[#3370ff] hover:underline">← 返回</button>
    <h1 className="text-2xl font-bold">全部预警日志</h1>
    <div className="space-y-3">
      {MOCK_ALERTS.map(a => (
        <AlertItem
          key={a.id}
          type={a.type.includes('安全') ? 'safety' : 'quota'}
          title={a.type}
          desc={a.details}
          time={a.timestamp}
          level={a.priority.toLowerCase() as any}
          url={''}   // 详情页如无需“去处理”可置空
        />
      ))}
    </div>
  </div>
);

export default AlertLogs;