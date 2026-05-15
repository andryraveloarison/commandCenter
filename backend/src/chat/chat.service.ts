import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatGateway } from './chat.gateway';

const MESSAGE_INCLUDE = {
  user:  { select: { id: true, nom: true, username: true, photo: true } },
  reads: { include: { user: { select: { id: true, nom: true, username: true, photo: true } } } },
  poll:  { include: { votes: true } },
} as const;

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private gateway: ChatGateway) {}

  async findAll(limit = 20, before?: string) {
    const messages = await this.prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: before ? { createdAt: { lt: new Date(before) } } : undefined,
      include: MESSAGE_INCLUDE,
    });
    const items = messages.reverse();
    return { messages: items, hasMore: messages.length === limit };
  }

  async getUnreadCount(userId: string) {
    const total = await this.prisma.message.count();
    const read  = await this.prisma.messageRead.count({ where: { userId } });
    return { count: Math.max(0, total - read) };
  }

  async markAsRead(userId: string) {
    const messages = await this.prisma.message.findMany({ select: { id: true } });
    await Promise.all(
      messages.map((m) =>
        this.prisma.messageRead.upsert({
          where:  { messageId_userId: { messageId: m.id, userId } },
          create: { messageId: m.id, userId },
          update: {},
        }),
      ),
    );
    await this.prisma.notification.updateMany({
      where: { userId, type: 'MESSAGE', lu: false },
      data:  { lu: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nom: true, username: true, photo: true },
    });
    this.gateway.emitToAll('message:read', { user });

    return { success: true };
  }

  async create(userId: string, contenu: string) {
    const message = await this.prisma.message.create({
      data: { userId, contenu },
      include: MESSAGE_INCLUDE,
    });

    await this.prisma.messageRead.create({ data: { messageId: message.id, userId } });

    await this._notifyOthers(userId, message.user.nom, contenu);
    this.gateway.emitGroupMessage(message);
    return message;
  }

  async createMedia(userId: string, type: 'IMAGE' | 'FILE', contenu: string, fileName?: string) {
    const message = await this.prisma.message.create({
      data: { userId, contenu, type: type as any, fileName },
      include: MESSAGE_INCLUDE,
    });

    await this.prisma.messageRead.create({ data: { messageId: message.id, userId } });

    const preview = type === 'IMAGE' ? '📷 Image' : `📎 ${fileName ?? 'Fichier'}`;
    await this._notifyOthers(userId, message.user.nom, preview);
    this.gateway.emitGroupMessage(message);
    return message;
  }

  async createPoll(userId: string, question: string, options: string[]) {
    const poll = await this.prisma.poll.create({
      data: { question, options },
    });

    const message = await this.prisma.message.create({
      data: { userId, contenu: question, type: 'POLL', pollId: poll.id },
      include: MESSAGE_INCLUDE,
    });

    await this.prisma.messageRead.create({ data: { messageId: message.id, userId } });

    await this._notifyOthers(userId, message.user.nom, `Sondage : ${question}`);
    this.gateway.emitGroupMessage(message);
    return message;
  }

  async votePoll(pollId: string, userId: string, optionIndex: number) {
    await this.prisma.pollVote.upsert({
      where:  { pollId_userId: { pollId, userId } },
      create: { pollId, userId, optionIndex },
      update: { optionIndex },
    });

    const poll = await this.prisma.poll.findUnique({
      where:   { id: pollId },
      include: { votes: true },
    });

    this.gateway.emitPollUpdate(poll);
    return poll;
  }

  private async _notifyOthers(senderId: string, senderNom: string, preview: string) {
    const others = await this.prisma.user.findMany({
      where:  { id: { not: senderId } },
      select: { id: true },
    });
    if (!others.length) return;
    const text = preview.length > 60 ? preview.substring(0, 60) + '…' : preview;
    await this.prisma.notification.createMany({
      data: others.map((u) => ({
        userId:  u.id,
        titre:   `Nouveau message de ${senderNom}`,
        message: text,
        type:    'MESSAGE',
      })),
    });
  }
}
