import { UUID } from 'crypto';
import { Column, CreatedAt, DataType, HasOne, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import { z } from 'zod';
import { Quiz } from './quiz.entity';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';

export const takeQuizReqSchema = z.object({
  userEmail: z.string().email(),
});

export type TakeQuizReqType = z.infer<typeof takeQuizReqSchema>;

type QuizTakingAttributes = {
  quizId: UUID;
  userEmail: string;
  answers: Record<number, number>;
  totalScore: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type CreateQuizTakingAttributes = Omit<QuizTakingAttributes, 'createdAt' | 'updatedAt'>;

@Table({ tableName: 'quiz_taking', underscored: true })
export class QuizTaking extends Model<QuizTakingAttributes, CreateQuizTakingAttributes> {
  @PrimaryKey
  @Column
  quizId: UUID;

  @PrimaryKey
  @Column
  userEmail: string;

  @HasOne(() => Quiz, 'id')
  @ApiPropertyOptional()
  quiz: Quiz;

  @Column({ type: DataType.JSON })
  answers: Record<number, number>;

  @Column
  totalScore: number;

  @Column
  attemptCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export const answerQuizQuestionActionSchema = z.object({
  questionIndex: z.number().min(0),
  selectedAnswerIndex: z.number().min(0),
});

export class AnswerQuizQuestionActionType extends createZodDto(answerQuizQuestionActionSchema) {}

export class AnswerQuizQuestionResponse {
  public newTotalScore: number;
  public correct: boolean;
  constructor(newTotalScore: number, correct: boolean) {
    this.newTotalScore = newTotalScore;
    this.correct = correct;
  }
}
