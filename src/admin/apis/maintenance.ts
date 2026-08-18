import { axiosInstance } from '@apis/instance';

export const ADMIN_MAINTENANCE_QUERY_KEY = ['admin', 'maintenance'] as const;

export type Maintenance = {
  enabled: boolean;
  message?: string | null;
  estimatedEndAt?: string | null;
};

export type UpdateMaintenanceRequest = {
  enabled: boolean;
  message?: string;
  estimatedEndAt?: string;
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

const MAINTENANCE_PATH = '/admin/v1/maintenance';

export async function getMaintenance(): Promise<Maintenance> {
  const { data } = await axiosInstance.get<ApiResponse<Maintenance>>(MAINTENANCE_PATH);

  return data.result;
}

export async function updateMaintenance(request: UpdateMaintenanceRequest): Promise<Maintenance> {
  const { data } = await axiosInstance.put<ApiResponse<Maintenance>>(MAINTENANCE_PATH, request);

  return data.result;
}
