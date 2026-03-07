import { User } from "./user.interface";

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}