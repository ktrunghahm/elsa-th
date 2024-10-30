import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import configuration from 'config/configuration';
import { AuthenModule } from './authen/authen.module';
import { QuizModule } from './quiz/quiz.module';
import { Quiz } from './quiz/model/quiz';
import { QuizTaking } from './quiz/model/quizTaking';

@Module({
  imports: [
    AuthenModule,
    QuizModule,
    ConfigModule.forRoot({ load: [configuration] }),
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
  providers: [],
})
export class AppModule {}
