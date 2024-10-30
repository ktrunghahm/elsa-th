import { Body, Controller, Get, HttpCode, Post, Res, Session, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/zodUtils';
import { AuthenReqDto, authenReqSchema } from './authen.dto';
import { AuthenService } from './authen.service';
import { UserInfo } from './authen.types';
import { Response } from 'express';
import { RequestSession } from 'src/common/types';
import { AuthenGuard } from './authen.guard';

@Controller('authen')
export class AuthenController {
  constructor(private readonly authenService: AuthenService) {}

  @Post('authen-req')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenReqSchema))
  authenReq(
    @Body() authenReqDto: AuthenReqDto,
    @Res({ passthrough: true }) response: Response,
  ): { success: true; userInfo: UserInfo } | { success: false } {
    const authenResult = this.authenService.authen(authenReqDto.email, authenReqDto.password);
    if (authenResult) {
      response.cookie('email', authenReqDto.email, { httpOnly: true });
      return {
        success: true,
        userInfo: authenResult,
      };
    }
    return {
      success: false,
    };
  }

  @Get('user')
  @UseGuards(AuthenGuard)
  getCurrentUser(@Session() session: RequestSession) {
    return { user: session.user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('email', '', { httpOnly: true, maxAge: 0 });
    return { success: true };
  }
}
