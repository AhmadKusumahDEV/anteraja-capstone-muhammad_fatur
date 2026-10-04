export interface LoginRequest {
  nik: string;
  password: string;
}

export interface UserInfo {
  id: string;
  nik: string;
  name: string;
  role: 'HUB_ADMIN' | 'SUPER_ADMIN';
  hub_id: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: UserInfo;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface ApiError {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}
