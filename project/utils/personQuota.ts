import { MOCK_QUOTA_CONFIGS } from '../constants';
import { QuotaConfig } from '../types';

export function getPersonQuotaArea(title: string): number {
  const normalized = title.trim();
  const personnel = (MOCK_QUOTA_CONFIGS as QuotaConfig[]).filter(q => q.category === 'Personnel');

  const pick = (keyword: string) => personnel.find(q => q.name.includes(keyword));

  if (normalized.includes('教授') && !normalized.includes('副')) {
    return pick('正高级')?.value ?? pick('教授')?.value ?? 24;
  }
  if (normalized.includes('副教授')) {
    return pick('副高级')?.value ?? pick('副教授')?.value ?? 16;
  }
  return pick('中级')?.value ?? 9;
}



