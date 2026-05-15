import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddTeamMemberDto } from './dto/project.dto';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private chat: ChatGateway) {}

  private async assertProjectMember(projectId: string, userId: string, userRole: string) {
    if (userRole === 'DSI') return;
    const member = await this.prisma.projectTeam.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de ce projet.");
    }
  }

  async create(dto: CreateProjectDto, userId: string) {
    const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { nom: true, username: true } });

    const project = await this.prisma.project.create({
      data: {
        nom: dto.nom,
        description: dto.description,
        logo: dto.logo,
        dateDebut: new Date(dto.dateDebut),
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        priorite: (dto.priorite || 'MOYENNE') as any,
      },
    });

    // Add creator to team
    await this.prisma.projectTeam.create({
      data: { projectId: project.id, userId, role: 'COLONEL' },
    });

    const memberIds = [userId];

    // Add selected team members
    if (dto.teamUserIds && dto.teamUserIds.length > 0) {
      for (const memberId of dto.teamUserIds) {
        if (memberId !== userId) {
          await this.prisma.projectTeam.create({
            data: { projectId: project.id, userId: memberId, role: 'SOLDAT' },
          });
          memberIds.push(memberId);
        }
      }
    }

    // Broadcast to ALL → cache refresh
    this.chat.emitToAll('project:created', {
      projectId: project.id,
      nom: project.nom,
      actorUsername: actor?.username ?? 'inconnu',
    });

    // Notify team members only
    for (const memberId of memberIds) {
      this.chat.emitToUser(memberId, 'notification', {
        type: 'project:created',
        title: 'Nouveau dossier',
        message: `"${project.nom}" — vous faites partie de l'équipe`,
        projectId: project.id,
      });
    }

    return project;
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        teams: { include: { user: true } },
        tasks: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        teams: { include: { user: true } },
        modules: {
          include: {
            tasks: {
              where: { parentId: null },
              include: {
                assignee: true,
                subtasks: {
                  include: {
                    assignee: true,
                    subtasks: {
                      include: {
                        assignee: true,
                        subtasks: { include: { assignee: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tasks: { where: { moduleId: null } }, // Tasks without a module
        history: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: { id },
      data: dto as any,
    });
    this.chat.emitToAll('project:updated', { projectId: id, nom: project.nom });
    return project;
  }

  async remove(id: string) {
    const project = await this.prisma.project.delete({ where: { id } });
    this.chat.emitToAll('project:deleted', { projectId: id, nom: project.nom });
    return project;
  }

  async addTeamMember(projectId: string, dto: AddTeamMemberDto, requesterId: string, requesterRole: string) {
    await this.assertProjectMember(projectId, requesterId, requesterRole);

    const alreadyMember = await this.prisma.projectTeam.findFirst({
      where: { projectId, userId: dto.userId },
    });
    if (alreadyMember) {
      throw new ForbiddenException('Cet utilisateur est déjà membre du projet.');
    }

    return this.prisma.projectTeam.create({
      data: {
        projectId,
        userId: dto.userId,
        role: dto.role || 'SOLDAT',
      },
    });
  }

  async removeTeamMember(projectId: string, userId: string) {
    return this.prisma.projectTeam.deleteMany({
      where: {
        projectId,
        userId,
      },
    });
  }

  async calculateProgress(projectId: string, userId?: string, actionNote?: string) {
    const modules = await this.prisma.module.findMany({
      where: { projectId },
      include: { tasks: { where: { parentId: null } } },
    });

    const orphanTasks = await this.prisma.task.findMany({
      where: { projectId, moduleId: null, parentId: null },
    });

    let totalProgress = 0;
    let count = 0;

    // Calculate module progress from root tasks only
    for (const module of modules) {
      if (module.tasks.length > 0) {
        const moduleProgress = module.tasks.reduce((sum, t) => sum + t.progression, 0) / module.tasks.length;
        await this.prisma.module.update({
          where: { id: module.id },
          data: { progression: moduleProgress },
        });
        totalProgress += moduleProgress;
      }
      count++;
    }

    // Add orphan tasks to average
    for (const task of orphanTasks) {
      totalProgress += task.progression;
      count++;
    }

    const averageProgress = count > 0 ? totalProgress / count : 0;
    const oldProject = await this.prisma.project.findUnique({ where: { id: projectId } });

    // Auto-update status based on progression
    let newStatus: string;
    if (averageProgress >= 100) {
      newStatus = 'TERMINE';
    } else if (count > 0) {
      newStatus = 'EN_COURS';
    } else {
      newStatus = oldProject?.statut || 'PREPARATION';
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { progressionGlobale: averageProgress, statut: newStatus as any },
    });

    // Always record history when progression changes
    if (Math.abs((oldProject?.progressionGlobale || 0) - averageProgress) > 0.1 && userId) {
      await this.prisma.projectHistory.create({
        data: {
          projectId,
          userId,
          progression: averageProgress,
          note: actionNote || (averageProgress >= 100
            ? `✅ Projet terminé à 100%`
            : `Progression mise à jour à ${averageProgress.toFixed(1)}%`),
        },
      });
    }

    return averageProgress;
  }

  async getProjectHistory(projectId: string) {
    return this.prisma.projectHistory.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addProgressionHistory(projectId: string, userId: string, progression: number, note?: string) {
    const history = await this.prisma.projectHistory.create({
      data: {
        projectId,
        userId,
        progression,
        note,
      },
    });

    // Update project progress
    await this.calculateProgress(projectId);

    return history;
  }

  async getStatistics(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        teams: true,
      },
    });

    return {
      nom: project.nom,
      progression: project.progressionGlobale,
      statut: project.statut,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(t => t.statut === 'COMPLETEE').length,
      teamSize: project.teams.length,
      dateDebut: project.dateDebut,
      dateFin: project.dateFin,
    };
  }
}
