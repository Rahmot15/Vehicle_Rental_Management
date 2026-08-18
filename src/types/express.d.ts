import type { StaffJwtPayload } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<StaffJwtPayload, 'staffId' | 'email'>;
    }
  }
}

export {};
