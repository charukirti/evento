import z from 'zod';

export const requestOrganizerSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required').max(60),
  bio: z.string().min(1, 'Bio is required'),
  website: z.url({ error: 'Invalid URL' }).optional(),
});

export type RequestOrganizerInput = z.infer<typeof requestOrganizerSchema>;
