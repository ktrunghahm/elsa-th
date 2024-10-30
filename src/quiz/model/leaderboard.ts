import { UUID } from 'crypto';
import { Column, DataType, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';
import { z } from 'zod';

export const leaderboardContentSchema = z.array(
  z.object({ userEmail: z.string(), totalScore: z.number(), answeredQuestions: z.number() }),
);
export type LeaderboardContentType = z.infer<typeof leaderboardContentSchema>;

type LeaderboardAttributes = {
  quizId: UUID;
  content: LeaderboardContentType;
  updatedAt: Date;
};

type CreateLeaderboardAttributes = Omit<LeaderboardAttributes, 'updatedAt'>;

@Table({ tableName: 'leaderboard', underscored: true, createdAt: false })
export class Leaderboard extends Model<LeaderboardAttributes, CreateLeaderboardAttributes> {
  @PrimaryKey
  @Column
  quizId: UUID;

  @Column({ type: DataType.JSON })
  content: LeaderboardContentType;

  @UpdatedAt
  updatedAt: Date;
}
