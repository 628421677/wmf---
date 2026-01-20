import { BuildingAsset, Project } from '../types';

export const BUILDINGS_STORAGE_KEY = 'uniassets-buildings-v1';

export function getStoredBuildings(): BuildingAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BUILDINGS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BuildingAsset[]) : [];
  } catch {
    return [];
  }
}

export function setStoredBuildings(buildings: BuildingAsset[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BUILDINGS_STORAGE_KEY, JSON.stringify(buildings));
}

export function upsertBuildingFromProject(project: Project) {
  const existing = getStoredBuildings();
  const sourceProjectId = project.id;

  const value = project.finalAmount ?? project.auditAmount ?? project.contractAmount;

  const next: BuildingAsset = {
    id: `BLD-${sourceProjectId}`,
    name: project.name,
    code: sourceProjectId,
    location: project.location || '-',
    structure: 'Frame',
    value,
    status: 'TitleDeed',
    completionDate: project.actualEndDate || project.plannedEndDate || project.completionDate,
    hasCad: Boolean(project.hasCadData),
    floorCount: project.gaojibiaoData?.floorCount || 0,
    sourceProjectId,
  } as any;

  const foundIndex = existing.findIndex((b: any) => b.sourceProjectId === sourceProjectId || b.code === sourceProjectId || b.id === next.id);
  if (foundIndex >= 0) {
    const merged = { ...existing[foundIndex], ...next };
    const out = [...existing];
    out[foundIndex] = merged;
    setStoredBuildings(out);
    return;
  }

  setStoredBuildings([next, ...existing]);
}



