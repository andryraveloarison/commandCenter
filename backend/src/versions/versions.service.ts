import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateVersionDto } from './dto/version.dto';

const INCLUDE = { createdBy: { select: { id: true, nom: true, username: true, photo: true } } };

@Injectable()
export class VersionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVersionDto, userId: string) {
    return this.prisma.projectVersion.create({
      data: {
        projectId: dto.projectId,
        nom: dto.nom,
        description: dto.description,
        date: new Date(dto.date),
        createdById: userId,
      },
      include: INCLUDE,
    });
  }

  async findAll(projectId: string) {
    return this.prisma.projectVersion.findMany({
      where: { projectId },
      include: INCLUDE,
      orderBy: { date: 'asc' },
    });
  }

  async findOneWithTasks(id: string) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id },
      include: { ...INCLUDE, project: true },
    });

    if (!version) throw new NotFoundException('Version introuvable');

    // Version précédente (par date)
    const prevVersion = await this.prisma.projectVersion.findFirst({
      where: { projectId: version.projectId, date: { lt: version.date } },
      orderBy: { date: 'desc' },
    });

    const fromDate = prevVersion ? prevVersion.date : new Date(0);

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId: version.projectId,
        statut: 'COMPLETEE',
        OR: [
          { completedAt: { gt: fromDate, lte: version.date } },
          { completedAt: null, updatedAt: { gt: fromDate, lte: version.date } },
        ],
      },
      include: {
        assignee: { select: { id: true, nom: true, username: true, photo: true } },
        module: { select: { id: true, nom: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });

    return { ...version, tasks, previousVersion: prevVersion ?? null };
  }

  async remove(id: string) {
    return this.prisma.projectVersion.delete({ where: { id } });
  }
}
