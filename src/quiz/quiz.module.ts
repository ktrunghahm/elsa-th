import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminQuizController } from './controller/adminQuiz';
import { LeaderboardController } from './controller/leaderboard';
import { UserQuizController } from './controller/userQuiz';
import { Leaderboard } from './model/leaderboard';
import { Quiz } from './model/quiz';
import { QuizTaking } from './model/quizTaking';
import { QuizService } from './quiz.service';

@Module({
  imports: [SequelizeModule.forFeature([Quiz, QuizTaking, Leaderboard]), ],
  providers: [QuizService],
  controllers: [AdminQuizController, UserQuizController, LeaderboardController],
})
export class QuizModule {}
