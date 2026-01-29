import { useLocalStorage } from './useLocalStorage';
import { MOCK_PROJECTS } from '../constants';
import { Project, AuditLog, UserRole } from '../types';
import { normalizeAssetStatus } from '../utils/legacyAssetStatus';

export function useAssetData() {
  const [projects, setProjects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);

  const logAudit = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    userRole: UserRole,
    changedFields?: Record<string, { old: any; new: any }>
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action,
      entityType,
      entityId,
      entityName,
      changedFields,
      operator: '当前用户',
      operatorRole: userRole,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev].slice(0, 1000));
  };

  const normalizedProjects = projects.map((p) => ({
    ...p,
    status: normalizeAssetStatus((p as any).status),
  }));

  return { projects: normalizedProjects, setProjects, auditLogs, setAuditLogs, logAudit };
}
