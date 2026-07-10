import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, registerSchema } from './auth.schema';
import {
  loginController,
  logoutController,
  registerController,
  rotateRefreshTokenController,
} from './auth.controller';

const authRouter = Router();

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  registerController
);
authRouter.post('/login', validate({ body: loginSchema }), loginController);
authRouter.post('/refresh', rotateRefreshTokenController);
authRouter.post('/logout', logoutController);

export default authRouter;
