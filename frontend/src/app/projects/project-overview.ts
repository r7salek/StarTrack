import { newProjectResponse } from '../models/projectUpdate';

export type ProjectSort = 'projectName' | 'pi' | 'departmentPI' | 'status';
export const PROJECT_STATUSES = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'NOT_RECORDED', label: 'Not recorded' },
  { key: 'OTHER', label: 'Other' },
];

export function statusKey(project: newProjectResponse): string {
  const status = project.applyValue?.trim().toUpperCase();
  if (!status) return 'NOT_RECORDED';
  return PROJECT_STATUSES.slice(0, 4).some(item => item.key === status) ? status : 'OTHER';
}

export function statusLabel(project: newProjectResponse): string {
  const key = statusKey(project);
  return key === 'OTHER' ? `Other: ${project.applyValue}`
    : PROJECT_STATUSES.find(item => item.key === key)!.label;
}

export function piName(project: newProjectResponse): string {
  return [project.firstNamePI, project.lastNamePI].filter(Boolean).join(' ');
}

export function latestProjectVersions(rows: newProjectResponse[]): newProjectResponse[] {
  const latest = new Map<string, newProjectResponse>();
  for (const row of rows) {
    const existing = latest.get(row.projectId);
    if (!existing || row.versionNumber > existing.versionNumber) latest.set(row.projectId, row);
  }
  return Array.from(latest.values());
}

export function latestActiveProjects(rows: newProjectResponse[]): newProjectResponse[] {
  return latestProjectVersions(rows).filter(row => !row.archived);
}

export function searchProjects(rows: newProjectResponse[], query: string): newProjectResponse[] {
  const term = query.trim().toLowerCase();
  return rows.filter(row => [row.projectName, piName(row), row.departmentPI]
    .some(value => (value || '').toLowerCase().includes(term)));
}

export function sortProjects(rows: newProjectResponse[], field: ProjectSort, ascending: boolean): newProjectResponse[] {
  const value = (row: newProjectResponse) => field === 'pi' ? piName(row)
    : field === 'status' ? statusLabel(row) : row[field] || '';
  return [...rows].sort((a, b) => (ascending ? 1 : -1) * value(a).localeCompare(value(b)));
}
