type CreateReportResponse = {
  isSuccess: boolean;
  result?: {
    reportId?: number;
  };
};

import { Report } from '@apis/report/report';

type ReportData = Record<string, unknown>;

type ReportResponse = {
  isSuccess?: boolean;
  result?: ReportData;
};

export async function createReportSync(gitRepoId: number, token?: string) {
  const res = await fetch('https://api.devine.kr/api/v1/reports/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ gitRepoId }),
  });

  if (!res.ok) {
    throw new Error(`report create failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as ReportResponse | null;
  return data?.result ?? null;
}

export async function createReport(gitRepoId: number, token?: string) {
  const res = await fetch('https://api.devine.kr/api/v1/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ gitRepoId }),
  });

  if (!res.ok) {
    throw new Error(`report create failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as CreateReportResponse | null;
  return data?.result ?? null;
}

export async function getReportMain(gitRepoId: number, token?: string): Promise<Report | null> {
  const res = await fetch(`https://api.devine.kr/api/v1/reports/${gitRepoId}/main`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`report main failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as ReportResponse | null;
  return (data?.result as unknown as Report) ?? null;
}

export async function getReportDetail(gitRepoId: number, token?: string): Promise<Report | null> {
  const res = await fetch(`https://api.devine.kr/api/v1/reports/${gitRepoId}/detail`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`report detail failed: ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as ReportResponse | null;
  return (data?.result as unknown as Report) ?? null;
}
