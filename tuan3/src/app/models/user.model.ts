// src/app/models/user.model.ts
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
