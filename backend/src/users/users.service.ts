import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        nom: true,
        photo: true,
        role: true,
        statut: true,
        createdAt: true,
        activite: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        nom: true,
        photo: true,
        role: true,
        statut: true,
        createdAt: true,
        activite: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data = { ...dto } as any;
    
    if (data.password) {
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        nom: true,
        photo: true,
        role: true,
        statut: true,
        createdAt: true,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getStatistics(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        taskAssignments: true,
      },
    });

    const taskStats = {
      total: user.taskAssignments.length,
      completed: user.taskAssignments.filter(t => t.statut === 'COMPLETEE').length,
      inProgress: user.taskAssignments.filter(t => t.statut === 'EN_COURS').length,
    };

    return taskStats;
  }
}
