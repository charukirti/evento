import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  deleteUserController,
  getUserController,
  requestRoleChangeController,
} from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import { requestOrganizerSchema } from './users.schema';

const usersRoutes = Router();

usersRoutes.get('/me', authenticate, getUserController);
usersRoutes.delete('/me', authenticate, deleteUserController);
usersRoutes.post(
  '/me/request-organizer',
  authenticate,
  validate({ body: requestOrganizerSchema }),
  requestRoleChangeController
);

export default usersRoutes;
