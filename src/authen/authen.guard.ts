import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as cookie from 'cookie';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { RequestSession } from 'src/common/types.dto';

@Injectable()
export class AuthenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const userEmail = request.cookies['email'] as string;
    const userRole = request.cookies['role'] as string;

    if (!userEmail) {
      throw new UnauthorizedException();
    }

    request.session = { user: { email: userEmail, role: userRole } };
    return true;
  }
}

export class WSAuthenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const socket = context.switchToWs().getClient<Socket>();
    const cookieStr = socket.handshake.headers.cookie;
    const userEmail = cookie.parse(cookieStr || '')['email'];

    if (!userEmail) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

export interface SessionRequest extends Request {
  session: RequestSession;
}
