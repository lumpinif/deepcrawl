import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const authEmailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authEmailLoginValidator = () =>
  zValidator('form', authEmailLoginSchema);
