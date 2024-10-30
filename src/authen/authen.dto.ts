import { z } from 'zod';

export const authenReqSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .required();

export type AuthenReqDto = z.infer<typeof authenReqSchema>;
