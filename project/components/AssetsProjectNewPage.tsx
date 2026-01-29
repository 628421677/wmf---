import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuditLog, Project, UserRole } from '../types';
import ProjectForm from './ProjectForm';

const AssetsProjectNewPage: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('uniassets-projects-v2', MOCK_PROJECTS);
  const [, setAuditLogs] = useLocalStorage<AuditLog[]>('uniassets-audit-logs', []);

  const logAudit = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
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
    setAuditLogs(prev => [newLog, ...prev].slice(0, 1000));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-[#1f2329] flex items-center gap-2">
          <ClipboardCheck size={20} /> 新建工程项目
        </h2>
        <p className="text-[#646a73]">在此页面录入基建/修缮项目，提交后将写入项目库。</p>
      </div>

      <div className="bg-white rounded-lg border border-[#dee0e3] overflow-hidden">
        <ProjectForm
          mode="create"
          existingProjectCount={projects.length}
          onCancel={() => {
            // 页面级取消：不做跳转（路由在 App 内部用 currentView 管理），保持当前页
          }}
          onSubmit={newProject => {
            setProjects(prev => [newProject, ...prev]);
            logAudit('create', 'project', newProject.id, newProject.name);
          }}
        />
      </div>
    </div>
  );
};

export default AssetsProjectNewPage;
