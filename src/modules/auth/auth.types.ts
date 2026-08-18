import type { JwtPayload } from 'jsonwebtoken';

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface StaffAuthRecord {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

export interface AuthenticatedStaff {
  id: number;
  email: string;
  name: string;
}

export interface StaffJwtPayload extends JwtPayload {
  staffId: number;
  email: string;
}

export interface LoginResponse {
  token: string;
  staff: AuthenticatedStaff;
}
