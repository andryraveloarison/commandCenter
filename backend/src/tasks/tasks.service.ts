import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        titre: dto.titre,
        description: dto.description,
        priorite: (dto.priorite || 'MOYENNE') as any,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        assigneeId: dto.assigneeId,
        moduleId: dto.moduleId,
      },
      include: { assignee: true },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: { assignee: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        comments: { include: { user: true } },
        attachments: true,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.update({
      where: { id },
      data: dto as any,
    });

    // Recalculate project progress if progression changed
    if (dto.progression !== undefined) {
      const projectsService = new (require('../projects/projects.service').ProjectsService)(
        this.prisma
      );
      await projectsService.calculateProgress(task.projectId, userId);
    }

    return task;
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async addComment(taskId: string, projectId: string, userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        taskId,
        projectId,
        userId,
        contenu: dto.contenu,
      },
      include: { user: true },
    });
  }

  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTasksByUser(userId: string) {
    return this.prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
