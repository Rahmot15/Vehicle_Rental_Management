import type { RequestHandler, Response } from 'express';
import type { ApiResponse } from '../../types/api.types';
import type { AuthService } from './auth.service';
import type { LoginRequestBody, LoginResponse } from './auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login: RequestHandler = async (req, res): Promise<void> => {
    const requestBody = req.body as LoginRequestBody;
    const response = res as Response<ApiResponse<LoginResponse>>;
    const result = await this.authService.loginStaff(requestBody);

    if (!result) {
      response.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  };
}
