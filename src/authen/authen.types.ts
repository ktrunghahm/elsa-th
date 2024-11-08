import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userInfoSchema = z.object({ email: z.string(), role: z.string() });
export class UserInfo extends createZodDto(userInfoSchema) {}
