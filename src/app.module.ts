import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import configuration from 'config/configuration';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthenModule } from './authen/authen.module';
import { QuizModule } from './quiz/quiz.module';

@Module({
  imports: [
    AuthenModule,
    QuizModule,
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: configuration().dbHost,
      port: configuration().dbPort,
      username: configuration().dbUsername,
      password: configuration().dbPassword,
      database: configuration().dbName,
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
