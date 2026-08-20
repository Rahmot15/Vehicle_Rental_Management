import type { NextFunction, Request, Response } from 'express';
import type {} from '../types/express';
import jwt from 'jsonwebtoken';
import config from '../config';
import type { StaffJwtPayload } from '../modules/auth/auth.types';
import type { ApiResponse } from '../types/api.types';

function isStaffJwtPayload(payload: string | jwt.JwtPayload): payload is StaffJwtPayload {
  return (
    typeof payload !== 'string' &&
    typeof payload.staffId === 'number' &&
    typeof payload.email === 'string'
  );
}

export function authenticate(
  req: Request,
  res: Response<ApiResponse<never>>,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

    if (!isStaffJwtPayload(payload)) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
      return;
    }

    req.user = {
      staffId: payload.staffId,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}
