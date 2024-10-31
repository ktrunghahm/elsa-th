import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { RequestSession } from 'src/common/types';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

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

export class WSAuthenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const socket = context.switchToWs().getClient<Socket>();
    const cookieStr = socket.handshake.headers.cookie;
    const userEmail = cookie.parse(cookieStr || '')['email'];

    if (!userEmail) {
      return false;
    }

    return true;
  }
}

export interface SessionRequest extends Request {
  session: RequestSession;
}
