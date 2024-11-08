import { Body, Controller, Get, HttpCode, Post, Res, Session, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/zodUtils';
import { AuthenReqDto, authenReqSchema, GetUserResponse } from './authen.dto';
import { AuthenService } from './authen.service';
import { UserInfo } from './authen.types';
import { Response } from 'express';
import {
  AuthenFailureResponse,
  AuthenSuccessResponse,
  RequestSession,
  SimpleSuccessResponse,
} from 'src/common/types.dto';
import { AuthenGuard } from './authen.guard';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('authen')
export class AuthenController {
  constructor(private readonly authenService: AuthenService) {}

  @Post('authen-req')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenReqSchema))
  @ApiOkResponse({ type: AuthenSuccessResponse })
  authenReq(@Body() authenReqDto: AuthenReqDto, @Res({ passthrough: true }) response: Response) {
    const authenResult = this.authenService.authen(authenReqDto.email, authenReqDto.password);
    if (authenResult) {
      response.cookie('email', authenReqDto.email, { httpOnly: true });
      response.cookie('role', authenResult.role, { httpOnly: true });
      return new AuthenSuccessResponse(authenResult);
    }
    return new AuthenFailureResponse();
  }

  @Get('user')
  @UseGuards(AuthenGuard)
  getCurrentUser(@Session() session: RequestSession) {
    return new GetUserResponse(session.user);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('email', '', { httpOnly: true, maxAge: 0 });
    return new SimpleSuccessResponse();
  }
}
