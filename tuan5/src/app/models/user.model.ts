export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface UserListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

export interface LoginResponse {
  token?: string;
  user?: {
    email: string;
    name: string;
    role?: string;
  };
  data?: {
    sent?: boolean;
    expires_in_minutes?: number;
    message?: string;
  };
  error?: string;
}
