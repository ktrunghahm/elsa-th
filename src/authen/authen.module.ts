import { Module } from '@nestjs/common';
import { AuthenController } from './authen.controller';
import { AuthenService } from './authen.service';

@Module({
  imports: [],
  controllers: [AuthenController],
  providers: [AuthenService],
})
export class AuthenModule {}
