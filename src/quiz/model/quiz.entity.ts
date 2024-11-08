import { UUID } from 'crypto';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { z } from 'zod';
import { QuizTaking } from './quizTaking.entity';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const questionSchema = z.object({
  text: z.string(),
  options: z.array(z.object({ text: z.string(), answer: z.boolean() })),
});

export const questionWithoutAnswerSchema = z.object({
  text: z.string(),
  options: z.array(z.object({ text: z.string() })),
});

export const quizContentSchema = z.object({
  questions: z.array(questionSchema),
});

export class QuizContentType extends createZodDto(quizContentSchema) {}

export const createQuizReqSchema = z.object({
  name: z.string(),
  content: z.optional(quizContentSchema),
});

export class CreateQuizReqType extends createZodDto(createQuizReqSchema) {}

type QuizAttributes = {
  id: UUID;
  name: string;
  content: QuizContentType;
  createdAt: Date;
  updatedAt: Date;
};

type CreateQuizAttributes = Omit<QuizAttributes, 'createdAt' | 'updatedAt'>;

@Table({ tableName: 'quiz', underscored: true })
export class Quiz extends Model<QuizAttributes, CreateQuizAttributes> {
  @PrimaryKey
  @Column
  id: UUID;

  @Column
  name: string;

  @Column({ type: DataType.JSON })
  content: QuizContentType;

  @ApiPropertyOptional()
  @HasMany(() => QuizTaking, 'quizId')
  quizTakings: MinimalQuizTaking[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

class MinimalQuizTaking {
  public createdAt: Date;
}

export const quizForUserSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.number()),
  totalScore: z.number(),
  joinedAt: z.date(),
  lastActionAt: z.date(),

  quiz: z.object({
    name: z.string(),
    content: z.array(questionWithoutAnswerSchema),
  }),
});

export class QuizForUser extends createZodDto(quizForUserSchema) {}
