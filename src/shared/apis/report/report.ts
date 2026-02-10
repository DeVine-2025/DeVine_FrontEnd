import { ApiResponse } from '@apis/base/api';

export interface ReportCard {
  reportId: number;
  reportType: 'MAIN' | 'SUB' | string;
  visibility: 'PUBLIC' | 'PRIVATE' | string;
  repoName: string;
  repoDescription: string;
  createdAt: string;
}

export interface ReportCardResponse extends ApiResponse<{ reports: ReportCard[] }> {}

export interface ReportCardRequest {
  type: 'MAIN' | 'DETAIL';
}