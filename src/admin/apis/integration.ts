import { axiosInstance } from '@apis/instance';

export const ADMIN_INTEGRATION_HEALTH_QUERY_KEY = ['admin', 'integrations', 'health'] as const;

export type IntegrationStatus = 'NORMAL' | 'DELAYED' | 'DOWN' | 'UNKNOWN';

export type Integration = {
  type: string;
  name: string;
  status: IntegrationStatus;
  statusLabel: string;
  responseTimeMs: number | null;
  checkedAt: string | null;
  errorMessage: string | null;
};

export type IntegrationHealth = {
  checkedAt: string | null;
  integrations: Integration[];
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

const INTEGRATIONS_PATH = '/admin/v1/integrations';

export async function getIntegrationHealth(): Promise<IntegrationHealth> {
  const { data } = await axiosInstance.get<ApiResponse<IntegrationHealth>>(
    `${INTEGRATIONS_PATH}/health`,
  );

  return data.result;
}

export async function refreshIntegrationHealth(): Promise<IntegrationHealth> {
  const { data } = await axiosInstance.post<ApiResponse<IntegrationHealth>>(
    `${INTEGRATIONS_PATH}/health/refresh`,
  );

  return data.result;
}
