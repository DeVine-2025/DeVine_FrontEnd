import type { ReportCard } from '@apis/report/report';

export type ReportFolderGroup = { key: string; reports: ReportCard[] };
// A repository identifies a source, not an analysis run. Never merge by repo/name/date.
export function groupReportFolders(reports: ReportCard[]): ReportFolderGroup[] {
  const groups = new Map<string, ReportFolderGroup>();
  for (const report of reports) {
    const job = (report as ReportCard & { analysisJobId?: string | number }).analysisJobId;
    const key = job !== undefined && job !== null && String(job).trim()
      ? `job:${typeof job}:${job}:repo:${report.gitRepoId}` : `report:${report.reportId}`;
    const group = groups.get(key) ?? { key, reports: [] };
    group.reports.push(report);
    groups.set(key, group);
  }
  return [...groups.values()];
}
