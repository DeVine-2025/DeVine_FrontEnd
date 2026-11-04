import type { ReportCard } from '@apis/report/report';

export type ReportFolderGroup = { key: string; reports: ReportCard[] };
export function groupReportFolders(reports: ReportCard[]): ReportFolderGroup[] {
  const groups = new Map<string, ReportFolderGroup>();
  for (const report of reports) {
    const key = report.gitRepoId ? `repo:${report.gitRepoId}` : `report:${report.reportId}`;
    const group = groups.get(key) ?? { key, reports: [] };
    group.reports.push(report);
    groups.set(key, group);
  }
  return [...groups.values()];
}
