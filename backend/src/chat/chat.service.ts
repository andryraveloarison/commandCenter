import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.message.findMany({
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, nom: true, photo: true } },
      },
    });
  }

  async getCount() {
    return { count: await this.prisma.message.count() };
  }

  async create(userId: string, contenu: string) {
    return this.prisma.message.create({
      data: { userId, contenu },
      include: {
        user: { select: { id: true, nom: true, photo: true } },
      },
    });
  }
}
