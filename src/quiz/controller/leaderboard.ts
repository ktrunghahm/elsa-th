import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UUID } from 'crypto';
import { QuizService } from '../quiz.service';

@Controller('quiz/:quizId/leaderboard')
export class LeaderboardController {
  constructor(private readonly quizService: QuizService) {}

  @Get('')
  async getForQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    return await this.quizService.getLeaderBoard(quizId);
  }

  @Post('')
  async forceUpdate(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    const affectedCount = await this.quizService.updateLeaderBoard(quizId);
    return { success: true, affectedCount };
  }
}
