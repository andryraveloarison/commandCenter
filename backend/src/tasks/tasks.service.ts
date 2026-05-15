import { Injectable, ForbiddenException } from '@nestjs/common';
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

  private async assertProjectMember(projectId: string, userId: string, userRole: string) {
    if (userRole === 'DSI') return;
    const member = await this.prisma.projectTeam.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de ce projet.");
    }
  }

  async create(dto: CreateTaskDto, userId?: string, userRole?: string) {
    if (userId && userRole) {
      await this.assertProjectMember(dto.projectId, userId, userRole);
    }

    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        titre: dto.titre,
        description: dto.description,
        priorite: (dto.priorite || 'MOYENNE') as any,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        assigneeId: dto.assigneeId || null,
        moduleId: dto.moduleId,
        parentId: dto.parentId,
        situation: dto.situation || null,
        blocage: dto.blocage || null,
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

    const projectsService = new (require('../projects/projects.service').ProjectsService)(this.prisma);
    const actionNote = dto.parentId
      ? `Sous-tâche ajoutée : "${task.titre}"`
      : `Tâche ajoutée : "${task.titre}"`;
    await projectsService.calculateProgress(dto.projectId, userId, actionNote);

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
    const oldTask = await this.prisma.task.findUnique({ where: { id } });

    const data: any = { ...dto };

    // Sanitize optional fields — only when explicitly sent in the request
    if ('dateDebut' in dto) data.dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : null;
    if ('dateFin'   in dto) data.dateFin   = dto.dateFin   ? new Date(dto.dateFin)   : null;
    if ('assigneeId' in dto) data.assigneeId = dto.assigneeId || null;
    if ('situation'  in dto) data.situation  = dto.situation  || null;
    if ('blocage'    in dto) data.blocage    = dto.blocage    || null;

    // Determine new progression and statut after the update
    const newProgression = dto.progression !== undefined ? dto.progression : oldTask?.progression ?? 0;
    const wasCompleted = oldTask?.statut === 'COMPLETEE';

    if (dto.statut === 'COMPLETEE' || newProgression >= 100) {
      // Mark as completed
      data.statut = 'COMPLETEE';
      data.progression = Math.max(newProgression, 100);
      if (!wasCompleted) data.completedAt = new Date();
    } else if (dto.statut && dto.statut !== 'COMPLETEE' && wasCompleted) {
      // Explicitly reverted from COMPLETEE
      data.completedAt = null;
    } else if (dto.progression !== undefined && dto.progression < 100 && wasCompleted) {
      // Progression lowered below 100 while task was completed → revert
      data.statut = dto.progression > 0 ? 'EN_COURS' : 'TODO';
      data.completedAt = null;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    // Recalculate subtask-based progression if this task has subtasks
    await this.recalculateTaskProgress(id);

    // Recalculate project progress if progression changed
    if (dto.progression !== undefined || dto.statut !== undefined) {
      let actionNote: string | undefined;
      if (dto.progression !== undefined && oldTask && Math.round(oldTask.progression) !== Math.round(dto.progression)) {
        actionNote = `"${task.titre}" : ${Math.round(oldTask.progression)}% → ${Math.round(dto.progression)}%`;
      } else if (dto.statut !== undefined && oldTask && oldTask.statut !== dto.statut) {
        actionNote = `"${task.titre}" : statut ${oldTask.statut} → ${dto.statut}`;
      }
      const projectsService = new (require('../projects/projects.service').ProjectsService)(this.prisma);
      await projectsService.calculateProgress(task.projectId, userId, actionNote);
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

    const newStatut = avg >= 100 ? 'COMPLETEE' : avg > 0 ? 'EN_COURS' : 'TODO';
    const wasCompleted = task.statut !== 'COMPLETEE' && newStatut === 'COMPLETEE';
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        progression: avg,
        statut: newStatut as any,
        ...(wasCompleted ? { completedAt: new Date() } : {}),
      },
    });
  }

  async remove(id: string, userId?: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    const deleted = await this.prisma.task.delete({ where: { id } });
    if (task && !task.parentId) {
      const projectsService = new (require('../projects/projects.service').ProjectsService)(this.prisma);
      await projectsService.calculateProgress(task.projectId, userId, `Tâche supprimée : "${task.titre}"`);
    }
    return deleted;
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
