import type { Request, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { AuthService } from './auth.service';
import type { LoginRequestBody, LoginResponse } from './auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (
    req: Request<object, ApiResponse<LoginResponse>, LoginRequestBody>,
    res: Response<ApiResponse<LoginResponse>>,
  ): Promise<void> => {
    const result = await this.authService.loginStaff(req.body);

    if (!result) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  };
}
