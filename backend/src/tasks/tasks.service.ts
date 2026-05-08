import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto/task.dto';

// Helper to build a recursive subtask include
const subtaskInclude = (depth = 3): any => ({
  assignee: true,
  subtasks: depth > 0 ? { include: subtaskInclude(depth - 1) } : false,
});

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        titre: dto.titre,
        description: dto.description,
        priorite: (dto.priorite || 'MOYENNE') as any,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        assigneeId: dto.assigneeId,
        moduleId: dto.moduleId,
        parentId: dto.parentId,
      },
      include: { assignee: true },
    });

    // When a new (root) task is added to a project, set status to EN_COURS
    if (!dto.parentId) {
      await this.prisma.project.update({
        where: { id: dto.projectId },
        data: { statut: 'EN_COURS' as any },
      });
    }

    return task;
  }

  async findAll(projectId?: string) {
    return this.prisma.task.findMany({
      where: projectId ? { projectId, parentId: null } : { parentId: null },
      include: { assignee: true, comments: true, subtasks: { include: subtaskInclude() } },
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
        subtasks: { include: subtaskInclude() },
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.update({
      where: { id },
      data: dto as any,
    });

    // Recalculate subtask-based progression if this task has subtasks
    await this.recalculateTaskProgress(id);

    // Recalculate project progress if progression changed
    if (dto.progression !== undefined || dto.statut !== undefined) {
      const projectsService = new (require('../projects/projects.service').ProjectsService)(this.prisma);
      await projectsService.calculateProgress(task.projectId, userId);
    }

    return task;
  }

  // Recursively calculate a task's progression from its subtasks
  async recalculateTaskProgress(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
    });

    if (!task || task.subtasks.length === 0) return;

    // Recalculate each subtask first
    for (const subtask of task.subtasks) {
      await this.recalculateTaskProgress(subtask.id);
    }

    // Fetch updated subtasks
    const updatedSubtasks = await this.prisma.task.findMany({
      where: { parentId: taskId },
    });

    const avg = updatedSubtasks.reduce((sum, t) => sum + t.progression, 0) / updatedSubtasks.length;

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        progression: avg,
        statut: avg >= 100 ? 'COMPLETEE' : avg > 0 ? 'EN_COURS' : 'TODO',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  async addComment(taskId: string, projectId: string, userId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: { taskId, projectId, userId, contenu: dto.contenu },
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
