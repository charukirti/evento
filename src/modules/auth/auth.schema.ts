import z from 'zod';

export const registerSchema = z.object({
  name: z
    .string({
      error: (iss) =>
        iss.input === undefined ? 'Name is required' : 'Name must valid text',
    })
    .trim()
    .min(3, { error: 'Name must be at least 3 characters' }),

  email: z
    .email({
      error: (iss) =>
        iss.input === undefined
          ? 'Email is required'
          : 'Please enter a valid email address',
    })
    .trim()
    .toLowerCase()
    .max(60, { error: 'Email cannot exceed 60 characters' }),

  password: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? 'Password is required'
          : 'Invalid password format',
    })
    .min(8, { error: 'Password must be at least 8 characters' })
    .max(100, { error: 'Password cannot exceed 100 characters' })
    .regex(/[A-Z]/, {
      error: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      error: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { error: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Password must contain at least one special character',
    }),
});

export const loginSchema = z.object({
  email: z
    .email({
      error: (iss) =>
        iss.input === undefined
          ? 'Email is required'
          : 'Please enter a valid email address',
    })
    .trim()
    .max(60, { error: 'Email cannot exceed 60 characters' })
    .toLowerCase(),
  password: z.string({
    error: (iss) =>
      iss.input === undefined
        ? 'Password is required'
        : 'Invalid password format',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
