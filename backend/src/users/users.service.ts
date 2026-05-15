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
      const bcrypt = require('bcryptjs');
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

  async heartbeat(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activite: new Date() },
    });
    return { ok: true };
  }

  async findOnline() {
    const threshold = new Date(Date.now() - 45 * 1000);
    return this.prisma.user.findMany({
      where: { activite: { gte: threshold } },
      select: { id: true, nom: true, username: true, photo: true, role: true, statut: true, activite: true },
      orderBy: { activite: 'desc' },
    });
  }

  async getStatistics(id: string, period?: string) {
    const now = new Date();
    let since: Date;
    if (period === 'semaine') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'mois') {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'annee') {
      since = new Date(now.getFullYear(), 0, 1);
    } else {
      since = new Date(0);
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        taskAssignments: { where: { createdAt: { gte: since } } },
        interventionParticipations: {
          include: { intervention: true },
          where: { intervention: { createdAt: { gte: since } } },
        },
      },
    });

    const tasks = user.taskAssignments;
    const interventions = user.interventionParticipations.map(p => p.intervention);

    return {
      tasks: {
        total:      tasks.length,
        completed:  tasks.filter(t => t.statut === 'COMPLETEE').length,
        inProgress: tasks.filter(t => t.statut === 'EN_COURS').length,
        todo:       tasks.filter(t => t.statut === 'TODO').length,
      },
      interventions: {
        total:     interventions.length,
        resolu:    interventions.filter(i => i.statut === 'RESOLU').length,
        enCours:   interventions.filter(i => i.statut === 'EN_COURS').length,
        enAttente: interventions.filter(i => i.statut === 'EN_ATTENTE').length,
      },
      total: tasks.length + interventions.length,
    };
  }
}
