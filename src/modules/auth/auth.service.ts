import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import type { AuthRepository } from './auth.repository';
import type { LoginRequestBody, LoginResponse, StaffJwtPayload } from './auth.types';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginStaff(credentials: LoginRequestBody): Promise<LoginResponse | null> {
    const staff = await this.authRepository.findStaffByEmail(credentials.email.toLowerCase());

    if (!staff) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, staff.password_hash);

    if (!isPasswordValid) {
      return null;
    }

    const payload: StaffJwtPayload = {
      staffId: staff.id,
      email: staff.email,
    };
    const token = jwt.sign(payload, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn,
    });

    return {
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    };
  }
}
