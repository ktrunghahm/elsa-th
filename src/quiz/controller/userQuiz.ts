import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Session,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { AuthenGuard } from 'src/authen/authen.guard';
import { IllegalActionError } from 'src/common/error';
import { RequestSession } from 'src/common/types';
import { ZodValidationPipe } from 'src/common/zodUtils';
import { AnswerQuizQuestionActionType, QuizTaking, takeQuizReqSchema } from '../model/quizTaking';
import { QuizService } from '../quiz.service';

@Controller('user/quiz')
@UseGuards(AuthenGuard)
export class UserQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post(':quizId/join')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(takeQuizReqSchema))
  async joinQuiz(
    @Param('quizId', new ParseUUIDPipe()) quizId: UUID,
    @Session() session: RequestSession,
  ): Promise<QuizTaking> {
    const [quizTaker] = await this.quizService.joinQuiz(session.user.email, quizId);
    return quizTaker;
  }

  @Post(':quizId/answer')
  @HttpCode(200)
  async answerQuizQuestion(
    @Param('quizId', new ParseUUIDPipe()) quizId: UUID,
    @Body() answerQuizQuestionActionDto: AnswerQuizQuestionActionType,
    @Session() session: RequestSession,
  ) {
    try {
      const userEmail = session.user.email;

      return await this.quizService.answerQuizQuestion(quizId, answerQuizQuestionActionDto, userEmail);
    } catch (error) {
      throw new HttpException(
        error,
        error instanceof IllegalActionError || error instanceof NotFoundException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':quizId/')
  async getQuizByUser(@Param('quizId', new ParseUUIDPipe()) quizId: UUID, @Session() session: RequestSession) {
    return await this.quizService.getQuizByUser(quizId, session.user.email);
  }

  @Get(':quizId/online-count')
  async getOnlineCountForQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    return { count: await this.quizService.onlineCountForQuiz(quizId) };
  }

  @Get('taking')
  async listTakingQuizzesForUser(@Session() session: RequestSession) {
    return await this.quizService.listTakingQuizzesForUser(session.user.email);
  }

  @Get('')
  async listAvailableQuizzesForUser(@Session() session: RequestSession) {
    return await this.quizService.listQuizzesForUser(session.user.email);
  }
}
