import {ApiResponse} from '@apis/base/api';

export interface TechStack {
  techstackName: string;
  techGenre: string;
  rate: number;
}

export interface ReportCard {
  reportId: number;
  gitUrl: string;
  content: string;
  techstacks: TechStack[];
  createdAt: string;
}

export interface ReportCardResponse extends ApiResponse<{ reports: ReportCard[] }> {}
