export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface ApiResponse<T> {
  success: boolean;
  token: string;
  msg: T;
}
