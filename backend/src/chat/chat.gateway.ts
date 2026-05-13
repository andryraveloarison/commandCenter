import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /* On connection: extract JWT, join user-specific room */
  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as any)?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) return;

    try {
      const secret = process.env.JWT_SECRET || 'command-center-secret-key-military-operations';
      const payload = jwt.verify(token, secret) as any;
      const userId: string = payload.sub || payload.id;
      client.data.userId = userId;
      client.join(`user:${userId}`);
    } catch {}
  }

  handleDisconnect(_client: Socket) {}

  emitGroupMessage(message: any) {
    this.server.emit('group_message', message);
  }

  emitPollUpdate(poll: any) {
    this.server.emit('poll_update', poll);
  }

  emitDmMessage(senderId: string, receiverId: string, message: any) {
    this.server.to(`user:${receiverId}`).emit('dm_message', message);
    this.server.to(`user:${senderId}`).emit('dm_message', message);
  }
}
