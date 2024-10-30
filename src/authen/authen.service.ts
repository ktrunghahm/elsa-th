import { Injectable } from '@nestjs/common';
import { UserInfo } from './authen.types';

@Injectable()
export class AuthenService {
  authen(email: string, password: string): UserInfo | null {
    // this is a simple hardcoded authentication service
    if (email === 'admin@admin.com') {
      if (password === 'admin') {
        return {
          email,
          role: 'admin',
        };
      }
    } else {
      if (password === '123') {
        return {
          email,
          role: 'user',
        };
      }
    }
    return null;
  }
}
