import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('validation.emailInvalid'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export type SignInInput = z.infer<typeof signInSchema>;
