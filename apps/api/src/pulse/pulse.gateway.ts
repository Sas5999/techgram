import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/pulse',
})
export class PulseGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PulseGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection_ack', {
      status: 'connected',
      timestamp: new Date().toISOString(),
      message: 'Welcome to Techgram Live Pulse Gateway',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_topics')
  handleSubscribeTopics(
    @MessageBody() topics: string[],
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} subscribing to: ${topics.join(', ')}`);
    topics.forEach((topic) => {
      client.join(topic);
    });
    return { event: 'subscribe_topics', status: 'success', topics };
  }

  broadcastPulseUpdate(data: any) {
    this.server.emit('pulse_update', data);
    if (data.category) {
      this.server.to(`room:${data.category.toLowerCase()}`).emit('pulse_update', data);
    }
  }

  broadcastFeedUpdate(data: any) {
    this.server.emit('feed_update', data);
  }
}
