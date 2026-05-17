import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../common/prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  /* socketId → userId */
  private readonly connectedSockets = new Map<string, string>();

  async handleConnection(client: Socket) {
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

      this.connectedSockets.set(client.id, userId);

      // Mark user as online and broadcast updated list
      await this.prisma.user.update({ where: { id: userId }, data: { activite: new Date() } });
      await this.broadcastOnlineUsers();
    } catch {}
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    this.connectedSockets.delete(client.id);

    if (userId) {
      // Only broadcast if no other sockets remain for this user
      const stillConnected = [...this.connectedSockets.values()].includes(userId);
      if (!stillConnected) await this.broadcastOnlineUsers();
    }
  }

  private async broadcastOnlineUsers() {
    const onlineUserIds = [...new Set(this.connectedSockets.values())];
    const users = onlineUserIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: onlineUserIds } },
          select: { id: true, nom: true, username: true, photo: true, role: true, statut: true, activite: true },
        })
      : [];
    this.server.emit('users:online_update', users);
  }

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

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
