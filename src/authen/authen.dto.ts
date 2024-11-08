import { z } from 'zod';
import { UserInfo } from './authen.types';
import { createZodDto } from 'nestjs-zod';

export const authenReqSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export class AuthenReqDto extends createZodDto(authenReqSchema) {}

export class GetUserResponse {
  public user: UserInfo;
  constructor(user: UserInfo) {
    this.user = user;
  }
}
