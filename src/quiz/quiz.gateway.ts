import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { WSAuthenGuard } from 'src/authen/authen.guard';
import { LEADERBOARD_UPDATED, QUESTION_ANSWERED } from 'src/common/redis';
import { QuizService } from './quiz.service';

@WebSocketGateway(3200, {
  cors: {
    origin: 'http://localhost:3000',
  },
  transports: ['websocket'],
  path: '/quiz',
})
@UseGuards(WSAuthenGuard)
export class QuizGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(
    private configService: ConfigService,
    private quizService: QuizService,
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    const quizId = client.handshake.query['quizId'];
    if (!quizId) {
      client.disconnect();
    } else {
      const redisClient = new Redis({
        host: this.configService.get('redisHost'),
        port: this.configService.get('redisPort'),
        password: this.configService.get('redisPassword'),
      });

      const id = Array.isArray(quizId) ? quizId[0] : quizId;

      redisClient.subscribe(id);
      redisClient.on('message', async (channel, message) => {
        if (message === QUESTION_ANSWERED) {
          if (!client.disconnected) {
            await this.quizService.requestLeaderBoardUpdate(channel as UUID);
            client.send(LEADERBOARD_UPDATED);
          } else {
            await redisClient.quit();
            redisClient.disconnect();
          }
        }
      });

      this.quizService.changeConnectedWSClientCount(1);

      // disconnect client if ping is not responded
      const disconnectSocket = async () => {
        try {
          await client.timeout(1000).emitWithAck('message', 'ping');
          setTimeout(disconnectSocket, 5000);
        } catch (e) {
          if (!client.disconnected) {
            client.disconnect(true);
          }
          this.quizService.changeConnectedWSClientCount(-1);
          redisClient.disconnect();
          this.logger.log('Client disconnected by server');
        }
      };
      setTimeout(disconnectSocket, 5000);
    }
  }

  @SubscribeMessage('ping')
  async pingPong(@ConnectedSocket() socket: Socket, request) {
    return 'pong';
  }
}
