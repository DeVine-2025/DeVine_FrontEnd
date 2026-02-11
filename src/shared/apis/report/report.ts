import { ApiResponse } from '@apis/base/api';

/** =====================================================
 *  1. 카드 목록
 *  ===================================================== */

export interface ReportCard {
  reportId: number;
  gitRepoId: number;
  reportType: 'MAIN' | 'SUB' | string;
  visibility: 'PUBLIC' | 'PRIVATE' | string;
  repoName: string;
  repoDescription: string;
  createdAt: string;
}

export interface ReportCardResponse
  extends ApiResponse<{ reports: ReportCard[] }> {}

export interface ReportCardRequest {
  type: 'MAIN' | 'DETAIL';
}

/** =====================================================
 *  2. 리포트 생성 요청
 *  ===================================================== */

export interface ReportDetailRequest {
  gitRepoId: number;
  token: string;
}

/** =====================================================
 *  3. DETAIL 리포트
 *  ===================================================== */

export interface CodeInsight {
  title: string;
  number: number;
  points: string[];
  codeLocation: string[];
}

export interface Improvement {
  title: string;
  number: number;
  keywords: string;
  suggestions: string[];
  currentState: string[];
}

export interface NextStep {
  title: string;
  number: number;
  description: string[];
}

export interface ProjectOverview {
  projectScale: {
    mainCodeFiles: number;
    totalCodeLines: number;
    developmentPeriod: string;
    architecturePattern: string;
  };
  purpose: string;
  techStack: any[];
}

export interface ProjectSummary {
  implemented: any[];
  notImplemented: string[];
}

export interface ReportDetailContent {
  codeInsights: CodeInsight[];
  implementedFeatures: any[];
  improvements: Improvement[];
  nextSteps: NextStep[];
  projectOverview: ProjectOverview;
  projectSummary: ProjectSummary;
  reportTitle: string;
  reportSubtitle: string;
}

export interface ReportDetail {
  reportId: number;
  gitRepoId: number;
  gitRepoUrl: string;
  reportType: 'DETAIL';
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  completedAt: string;
  content: ReportDetailContent;
}

export interface ReportDetailResponse
  extends ApiResponse<ReportDetail> {}

/** =====================================================
 *  4. MAIN 리포트
 *  ===================================================== */

export interface AiEvaluation {
  title: string;
  details: string[];
}

export interface KeyImplementation {
  title: string;
  description: string;
  capabilities: string[];
}

export interface MainOverview {
  capabilities: string[];
  mainTech: string;
  scale: string;
  summary: string;
}

export interface ProjectInfo {
  projectName: string;
  scale: string;
  techStack: string[];
}

export interface ReportMainContent {
  aiEvaluation: AiEvaluation[];
  keyImplementations: KeyImplementation[];
  overview: MainOverview;
  projectInfo: ProjectInfo;
  recommendations: string[];
}

export interface ReportMain {
  reportId: number;
  gitRepoId: number;
  gitRepoUrl: string;
  reportType: 'MAIN';
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  completedAt: string;
  content: ReportMainContent;
}

export interface ReportMainResponse
  extends ApiResponse<ReportMain> {}

/** =====================================================
 *  5. MAIN + DETAIL 통합 타입 (핵심)
 *  ===================================================== */

export type Report = ReportMain | ReportDetail;
