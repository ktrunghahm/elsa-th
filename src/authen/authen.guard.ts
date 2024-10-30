import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { RequestSession } from 'src/common/types';

@Injectable()
export class AuthenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const userEmail = request.cookies['email'] as string;

    if (!userEmail) {
      return false;
    }

    request.session = { user: { email: userEmail } };
    return true;
  }
}

export interface SessionRequest extends Request {
  session: RequestSession;
}
