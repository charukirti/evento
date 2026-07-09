import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, registerSchema } from './auth.schema';
import { loginController, registerController } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), registerController);
authRouter.post('/login', validate({ body: loginSchema }), loginController);

export default authRouter;