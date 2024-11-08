import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/zodUtils';
import { createQuizReqSchema, CreateQuizReqType, Quiz, QuizContentType } from '../model/quiz.entity';
import { QuizService } from '../quiz.service';
import { faker } from '@faker-js/faker';
import { DatabaseError } from 'sequelize';
import { UUID } from 'crypto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { SimpleCountResponse, SimpleSuccessResponse } from '../../common/types.dto';

@Controller('admin/quiz')
export class AdminQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('')
  @HttpCode(201)
  @ApiCreatedResponse({ type: Quiz })
  @UsePipes(new ZodValidationPipe(createQuizReqSchema))
  async createQuiz(@Body() createQuizReqDto: CreateQuizReqType): Promise<Quiz> {
    try {
      const quiz = await this.quizService.createQuiz(
        createQuizReqDto.name,
        createQuizReqDto.content || fakeQuizContent(),
      );
      return quiz;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':quizId')
  @ApiOkResponse({ type: SimpleSuccessResponse })
  async deleteQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    const result = await this.quizService.deleteQuiz(quizId);
    return new SimpleSuccessResponse(result > 0);
  }

  @Get('')
  @ApiOkResponse({ type: Quiz, isArray: true })
  async listQuizzes() {
    return await this.quizService.listQuizzes();
  }

  @Get('total-connected-ws-client')
  @ApiOkResponse({ type: SimpleCountResponse })
  getTotalConnectedWSClient() {
    return new SimpleCountResponse(this.quizService.connectedWSClientCount);
  }
}

function fakeQuizContent(): QuizContentType {
  const numOfQuestions = faker.number.int({ min: 3, max: 15 });

  const questions: QuizContentType['questions'] = [];
  for (let i = 0; i < numOfQuestions; i += 1) {
    questions.push({
      text: faker.lorem.sentence(20),
      options: [
        {
          text: faker.lorem.word(),
          answer: i % 4 === 0,
        },
        {
          text: faker.lorem.word(),
          answer: i % 4 === 1,
        },
        {
          text: faker.lorem.word(),
          answer: i % 4 === 2,
        },
        {
          text: faker.lorem.word(),
          answer: i % 4 === 3,
        },
      ],
    });
  }

  return {
    questions,
  };
}
