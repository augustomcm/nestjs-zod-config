import { z } from 'zod';

export const environmentSchema = z.enum(['development', 'production']);

export const databaseSchema = z.object({
  host: z.string().min(1),
  database: z.string().min(1),
  password: z.string().min(1),
  port: z.coerce.number().min(1),
  username: z.string().min(1),
});

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  database: databaseSchema,
});
