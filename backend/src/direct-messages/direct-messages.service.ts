import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

const USER_SELECT = { select: { id: true, nom: true, username: true, photo: true } };

@Injectable()
export class DirectMessagesService {
  constructor(private prisma: PrismaService, private gateway: ChatGateway) {}

  /* All conversations for the current user (one entry per partner) */
  async getConversations(userId: string) {
    const messages = await this.prisma.privateMessage.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { sender: USER_SELECT, receiver: USER_SELECT },
      orderBy: { createdAt: 'desc' },
    });

    const seen = new Set<string>();
    const convs: { partner: any; lastMessage: any; unread: number }[] = [];

    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (seen.has(partner.id)) continue;
      seen.add(partner.id);

      const unread = await this.prisma.privateMessage.count({
        where: { senderId: partner.id, receiverId: userId, lu: false },
      });

      convs.push({ partner, lastMessage: msg, unread });
    }

    return convs;
  }

  /* Messages between current user and a partner */
  async getMessages(userId: string, partnerId: string) {
    return this.prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      include: { sender: USER_SELECT },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  /* Send a DM */
  async sendMessage(senderId: string, receiverId: string, contenu: string) {
    const msg = await this.prisma.privateMessage.create({
      data: { senderId, receiverId, contenu },
      include: { sender: USER_SELECT },
    });

    const preview = contenu.length > 60 ? contenu.substring(0, 60) + '…' : contenu;
    await this.prisma.notification.create({
      data: {
        userId: receiverId,
        titre: `Message privé de ${msg.sender.nom}`,
        message: preview,
        type: 'MESSAGE',
      },
    });

    // Push to both sender and receiver in real-time
    this.gateway.emitDmMessage(senderId, receiverId, msg);

    return msg;
  }

  /* Mark all messages from partner as read */
  async markAsRead(userId: string, partnerId: string) {
    await this.prisma.privateMessage.updateMany({
      where: { senderId: partnerId, receiverId: userId, lu: false },
      data: { lu: true },
    });
    return { success: true };
  }

  /* Total unread DMs for a user */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.privateMessage.count({
      where: { receiverId: userId, lu: false },
    });
    return { count };
  }
}
