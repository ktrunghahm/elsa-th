import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UUID } from 'crypto';
import { QuizService } from '../quiz.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Leaderboard } from '../model/leaderboard.entity';
import { SimpleCountResponse } from '../../common/types.dto';

@Controller('quiz/:quizId/leaderboard')
export class LeaderboardController {
  constructor(private readonly quizService: QuizService) {}

  @Get('')
  @ApiOkResponse({ type: Leaderboard })
  async getForQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    return await this.quizService.getLeaderBoard(quizId);
  }

  @Post('')
  @ApiCreatedResponse({ type: SimpleCountResponse })
  async forceUpdate(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    const [affectedCount] = await this.quizService.updateLeaderBoard(quizId);
    return new SimpleCountResponse(affectedCount);
  }
}
