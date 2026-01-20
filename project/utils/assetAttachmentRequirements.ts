import { AssetStatus, ProjectAttachment } from '../types';

export type AttachmentType = ProjectAttachment['type'];

export interface AttachmentRequirement {
  type: AttachmentType;
  label: string;
  required: boolean;
  description?: string;
}

export interface StageAttachmentRequirements {
  stage: AssetStatus;
  stageLabel: string;
  requiredAttachments: AttachmentRequirement[];
}

const TYPE_LABEL: Record<AttachmentType, string> = {
  approval: '立项批复',
  bidding: '招标文件',
  contract: '合同文件',
  change: '变更签证',
  drawing: '竣工图纸',
  acceptance: '验收报告',
  audit: '审计/决算报告',
  other: '其他',
};

export function getAttachmentTypeLabel(type: AttachmentType) {
  return TYPE_LABEL[type] || type;
}

export const STAGE_ATTACHMENT_REQUIREMENTS: StageAttachmentRequirements[] = [
  {
    stage: AssetStatus.Draft,
    stageLabel: '基建处起草',
    requiredAttachments: [],
  },
  {
    stage: AssetStatus.PendingReview,
    stageLabel: '待审核',
    requiredAttachments: [
      { type: 'approval', label: TYPE_LABEL.approval, required: true, description: '立项批复文件/需求申请表等' },
      { type: 'bidding', label: TYPE_LABEL.bidding, required: true, description: '招标/投标/评标相关文件' },
      { type: 'contract', label: TYPE_LABEL.contract, required: true, description: '施工/采购合同（规格、数量、验收条款等）' },
      { type: 'acceptance', label: TYPE_LABEL.acceptance, required: true, description: '竣工初验/正式验收报告' },
      { type: 'audit', label: TYPE_LABEL.audit, required: true, description: '审计/决算报告' },
      { type: 'drawing', label: TYPE_LABEL.drawing, required: false, description: '竣工图纸（如有）' },
      { type: 'change', label: TYPE_LABEL.change, required: false, description: '工程变更/签证（如有）' },
      { type: 'other', label: TYPE_LABEL.other, required: false, description: '其他材料（如有）' },
    ],
  },
  {
    stage: AssetStatus.PendingArchive,
    stageLabel: '待归档',
    requiredAttachments: [
      { type: 'other', label: '档案归档清单/移交单', required: true, description: '档案馆接收清单/移交确认等' },
    ],
  },
  {
    stage: AssetStatus.Archive,
    stageLabel: '已归档',
    requiredAttachments: [],
  },
];

export function getStageAttachmentRequirements(stage: AssetStatus): StageAttachmentRequirements {
  return (
    STAGE_ATTACHMENT_REQUIREMENTS.find(s => s.stage === stage) || {
      stage,
      stageLabel: stage,
      requiredAttachments: [],
    }
  );
}

export interface AttachmentCompletionStat {
  requiredTotal: number;
  requiredApproved: number;
  requiredRejected: number;
  requiredPending: number;
  missingRequired: number;
}

export function computeAttachmentCompletion(stage: AssetStatus, attachments: ProjectAttachment[] = []): AttachmentCompletionStat {
  const req = getStageAttachmentRequirements(stage);
  const required = req.requiredAttachments.filter(a => a.required);

  const byType = new Map<AttachmentType, ProjectAttachment[]>();
  attachments.forEach(a => {
    const t = a.type;
    const arr = byType.get(t) || [];
    arr.push(a);
    byType.set(t, arr);
  });

  let requiredApproved = 0;
  let requiredRejected = 0;
  let requiredPending = 0;
  let missingRequired = 0;

  required.forEach(r => {
    const list = byType.get(r.type) || [];
    if (list.length === 0) {
      missingRequired += 1;
      return;
    }

    const statuses = list.map(a => a.reviewStatus || 'Pending');
    if (statuses.includes('Approved')) requiredApproved += 1;
    else if (statuses.includes('Rejected')) requiredRejected += 1;
    else requiredPending += 1;
  });

  return {
    requiredTotal: required.length,
    requiredApproved,
    requiredRejected,
    requiredPending,
    missingRequired,
  };
}



