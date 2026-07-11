import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../lib/errors';
import { deleteUser, getUser, requestRoleChange } from './users.service';
import type { RequestOrganizerInput } from './users.schema';

export async function getUserController(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const userId = req.user.userId;

  const user = await getUser(userId);

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
}

export async function deleteUserController(req: Request, res: Response) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const userId = req.user.userId;

  await deleteUser(userId);

  res.status(200).json({ success: true, message: 'User deleted successfully' });
}

export async function requestRoleChangeController(
  req: Request<{}, {}, RequestOrganizerInput>,
  res: Response
) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const userId = req.user.userId;

  const { organizationName, bio, website } = req.body;

  const request = await requestRoleChange(userId, {
    organizationName,
    bio,
    website,
  });

  res.status(201).json({
    success: true,
    message: 'Request to role change in queue',
    data: request,
  });
}
