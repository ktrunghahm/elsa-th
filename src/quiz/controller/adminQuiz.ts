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
import { createQuizReqSchema, CreateQuizReqType, Quiz, QuizContentType } from '../model/quiz';
import { QuizService } from '../quiz.service';
import { faker } from '@faker-js/faker';
import { DatabaseError } from 'sequelize';
import { UUID } from 'crypto';

@Controller('admin/quiz')
export class AdminQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('')
  @HttpCode(201)
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
  async deleteQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: UUID) {
    const result = await this.quizService.deleteQuiz(quizId);
    return result;
  }

  @Get('')
  async listQuizzes() {
    return await this.quizService.listQuizzes();
  }

  @Get('total-connected-ws-client')
  getTotalConnectedWSClient() {
    return { count: this.quizService.connectedWSClientCount };
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
