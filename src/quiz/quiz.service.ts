import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { randomUUID, UUID } from 'crypto';
import { Quiz, QuizContentType } from './model/quiz';
import { AnswerQuizQuestionActionType, QuizTaking } from './model/quizTaking';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { IllegalActionError } from 'src/common/error';
import { Leaderboard, leaderboardContentSchema } from './model/leaderboard';
import { LEADERBOARD_LIMIT } from './quiz.constants';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz) private quizModel: typeof Quiz,
    @InjectModel(QuizTaking) private quizTakingModel: typeof QuizTaking,
    @InjectModel(Leaderboard) private leaderboardModel: typeof Leaderboard,
    private sequelize: Sequelize,
  ) {}

  async listQuizzes() {
    return await this.quizModel.findAll({ limit: 100, order: [['createdAt', 'DESC']] });
  }

  async getQuiz(id: UUID) {
    return await this.quizModel.findByPk(id);
  }

  async createQuiz(name: string, content: QuizContentType) {
    const result = await this.sequelize.transaction(async (transaction) => {
      const id = randomUUID();
      const [quiz] = await Promise.all([
        this.quizModel.create(
          {
            id,
            name,
            content,
          },
          { transaction },
        ),
        this.leaderboardModel.create({ quizId: id, content: leaderboardContentSchema.parse([]) }, { transaction }),
      ]);
      return quiz;
    });
    return result;
  }

  async deleteQuiz(id: UUID) {
    return await this.quizModel.destroy({ where: { id } });
  }

  async joinQuiz(userEmail: string, quizId: UUID) {
    return await this.quizTakingModel.findOrCreate({
      where: { quizId, userEmail },
      defaults: {
        userEmail,
        quizId,
        answers: {},
        totalScore: 0,
      },
    });
  }

  async answerQuizQuestion(quizId: UUID, answerQuizQuestionActionDto: AnswerQuizQuestionActionType, userEmail: string) {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) {
        throw new NotFoundException(`Cannot find quizId: ${quizId}`);
      }

      const result = await this.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
          autocommit: true,
        },
        async (transaction) => {
          const quizTaking = await this.quizTakingModel.findOne({
            where: { quizId, userEmail },
            transaction,
            lock: { level: transaction.LOCK.UPDATE, of: QuizTaking },
          });

          if (!quizTaking) {
            throw new IllegalActionError();
          }

          if (quizTaking.answers[answerQuizQuestionActionDto.questionIndex] != undefined) {
            throw new IllegalActionError('Already answered this question');
          }

          quizTaking.set('answers', {
            ...quizTaking.answers,
            [answerQuizQuestionActionDto.questionIndex]: answerQuizQuestionActionDto.selectedAnswerIndex,
          });

          const correct = Boolean(
            quiz.content.questions[answerQuizQuestionActionDto.questionIndex]?.options[
              answerQuizQuestionActionDto.selectedAnswerIndex
            ].answer,
          );
          const newTotalScore = correct ? quizTaking.totalScore + 1 : quizTaking.totalScore;
          if (correct) {
            quizTaking.set('totalScore', newTotalScore);
          }

          await quizTaking.save({ transaction });

          return { newTotalScore, correct };
        },
      );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getQuizByUser(quizId: UUID, userEmail: string) {
    const quizTaking = await this.quizTakingModel.findOne({
      where: { quizId, userEmail },
      include: [{ model: Quiz, as: 'quiz', required: true }],
    });

    if (!quizTaking) {
      throw new HttpException(`Not joined or cannot find quizId: ${quizId}`, HttpStatus.BAD_REQUEST);
    }

    return {
      quizId,
      answers: quizTaking.answers,
      totalScore: quizTaking.totalScore,
      joinedAt: quizTaking.createdAt,
      lastActionAt: quizTaking.updatedAt,

      // strip off the answer property in each question's options when the question is not yet answered
      quiz: {
        content: {
          questions: quizTaking.quiz.content.questions.map((question, i) => ({
            text: question.text,
            options: question.options.map((option) => ({
              text: option.text,
              answer: quizTaking.answers[i] !== undefined ? option.answer : null,
            })),
          })),
        },
      },
    };
  }

  async listTakingQuizzesForUser(userEmail: string) {
    const quizTakings = await this.quizTakingModel.findAll({
      where: { userEmail },
      order: [['updatedAt', 'DESC']],
      include: [{ model: Quiz, as: 'quiz', required: true, attributes: { exclude: ['content'] } }],
      limit: 100,
    });

    return quizTakings;
  }

  async listQuizzesForUser(userEmail: string) {
    return await this.quizModel.findAll({
      include: [
        {
          model: QuizTaking,
          as: 'quizTakings',
          where: { userEmail },
          required: false,
          attributes: { exclude: ['quizId', 'userEmail', 'answers', 'totalScore'] },
        },
      ],
      limit: 100,
      order: [['createdAt', 'DESC']],
    });
  }

  async updateLeaderBoard(quizId: UUID) {
    const quizTakings = await this.quizTakingModel.findAll({
      where: { quizId },
      order: [['totalScore', 'DESC']],
      limit: LEADERBOARD_LIMIT,
    });

    return await this.leaderboardModel.update(
      {
        content: quizTakings.map((quizTaking) => ({
          totalScore: quizTaking.totalScore,
          answeredQuestions: Object.keys(quizTaking.answers).length,
          userEmail: quizTaking.userEmail,
        })),
      },
      { where: { quizId } },
    );
  }

  async getLeaderBoard(quizId: UUID) {
    const result = await this.leaderboardModel.findByPk(quizId);
    return result;
  }
}
