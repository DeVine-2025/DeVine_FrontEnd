export type ReportData = Record<string, unknown>;

export type ReportResponse = {
  isSuccess?: boolean;
  result?: ReportData;
};

export type ReportType = 'MAIN' | 'DETAIL';
export type Visibility = 'PUBLIC' | 'PRIVATE';

export type MyReportItem = {
  reportId: number;
  gitRepoId: number;
  reportType: ReportType;
  visibility: Visibility;
  repoName: string;
  repoDescription?: string;
  createdAt: string;
};
