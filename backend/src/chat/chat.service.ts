import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatGateway } from './chat.gateway';

const READS_SELECT = {
  include: { user: { select: { id: true, nom: true, photo: true } } },
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private gateway: ChatGateway) {}

  async findAll() {
    return this.prisma.message.findMany({
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, nom: true, photo: true } },
        reads: READS_SELECT,
      },
    });
  }

  async getUnreadCount(userId: string) {
    const total = await this.prisma.message.count();
    const read = await this.prisma.messageRead.count({ where: { userId } });
    return { count: Math.max(0, total - read) };
  }

  async markAsRead(userId: string) {
    const messages = await this.prisma.message.findMany({ select: { id: true } });
    await Promise.all(
      messages.map((m) =>
        this.prisma.messageRead.upsert({
          where: { messageId_userId: { messageId: m.id, userId } },
          create: { messageId: m.id, userId },
          update: {},
        }),
      ),
    );
    await this.prisma.notification.updateMany({
      where: { userId, type: 'MESSAGE', lu: false },
      data: { lu: true },
    });
    return { success: true };
  }

  async create(userId: string, contenu: string) {
    const message = await this.prisma.message.create({
      data: { userId, contenu },
      include: {
        user: { select: { id: true, nom: true, photo: true } },
        reads: READS_SELECT,
      },
    });

    // Sender auto-marks as read
    await this.prisma.messageRead.create({ data: { messageId: message.id, userId } });

    // Create notifications for all other users
    const others = await this.prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true },
    });
    if (others.length > 0) {
      const preview = contenu.length > 60 ? contenu.substring(0, 60) + '…' : contenu;
      await this.prisma.notification.createMany({
        data: others.map((u) => ({
          userId: u.id,
          titre: `Nouveau message de ${message.user.nom}`,
          message: preview,
          type: 'MESSAGE',
        })),
      });
    }

    // Broadcast to all connected WebSocket clients
    this.gateway.emitGroupMessage(message);

    return message;
  }
}
