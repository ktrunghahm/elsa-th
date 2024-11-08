import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminQuizController } from './controller/adminQuiz';
import { LeaderboardController } from './controller/leaderboard';
import { UserQuizController } from './controller/userQuiz';
import { Leaderboard } from './model/leaderboard.entity';
import { Quiz } from './model/quiz.entity';
import { QuizTaking } from './model/quizTaking.entity';
import { QuizService } from './quiz.service';
import { QuizGateway } from './quiz.gateway';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [SequelizeModule.forFeature([Quiz, QuizTaking, Leaderboard]), CacheModule.register({})],
  providers: [QuizService, QuizGateway],
  controllers: [AdminQuizController, UserQuizController, LeaderboardController],
})
export class QuizModule {}
