export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}
