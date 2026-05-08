import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddTeamMemberDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        nom: dto.nom,
        description: dto.description,
        dateDebut: new Date(dto.dateDebut),
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        priorite: (dto.priorite || 'MOYENNE') as any,
      },
    });

    // Add creator to team
    await this.prisma.projectTeam.create({
      data: {
        projectId: project.id,
        userId: userId,
        role: 'COLONEL',
      },
    });

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
            tasks: { include: { assignee: true } },
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
    return this.prisma.project.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async addTeamMember(projectId: string, dto: AddTeamMemberDto) {
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

  async calculateProgress(projectId: string, userId?: string) {
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
          note: averageProgress >= 100
            ? `✅ Projet terminé à 100%`
            : `Progression mise à jour à ${averageProgress.toFixed(1)}%`,
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
