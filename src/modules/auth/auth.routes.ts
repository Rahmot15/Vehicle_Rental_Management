import { Router } from 'express';
import { validateBody } from '../../middlewares/validation.middleware';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { loginSchema } from '../../validations/auth.validation';

const authRouter = Router();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

authRouter.post('/login', validateBody(loginSchema), authController.login);

export default authRouter;
