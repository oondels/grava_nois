export interface ApiErrorDetail {
  code: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiErrorDetail;
  requestId?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
