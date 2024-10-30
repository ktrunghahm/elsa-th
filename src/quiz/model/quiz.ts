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
import { QuizTaking } from './quizTaking';

export const quizContentSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string(),
      options: z.array(z.object({ text: z.string(), answer: z.boolean() })),
    }),
  ),
});

export type QuizContentType = z.infer<typeof quizContentSchema>;

export const createQuizReqSchema = z.object({
  name: z.string(),
  content: z.optional(quizContentSchema),
});

export type CreateQuizReqType = z.infer<typeof createQuizReqSchema>;

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

  @HasMany(() => QuizTaking, 'quizId')
  quizTakings: { createdAt: Date }[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
