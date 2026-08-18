import { axiosInstance } from '@apis/instance';

export const ADMIN_AUTH_ME_QUERY_KEY = ['admin', 'auth', 'me'] as const;

export type AdminMe = {
  clerkId: string;
  email: string | null;
  role: 'ROLE_ADMIN';
};

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export async function getAdminMe(token: string): Promise<AdminMe> {
  const { data } = await axiosInstance.get<ApiResponse<AdminMe>>('/admin/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.result;
}
