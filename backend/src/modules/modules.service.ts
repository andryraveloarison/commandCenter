import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateModuleDto) {
    const module = await this.prisma.module.create({
      data: {
        projectId: dto.projectId,
        nom: dto.nom,
        description: dto.description,
        ...(dto.responsibleIds?.length ? {
          responsibles: {
            connect: dto.responsibleIds.map(id => ({ id })),
          },
        } : {}),
      },
      include: {
        tasks: { include: { assignee: true, subtasks: true } },
        responsibles: true,
      },
    });
    return module;
  }

  async findAll(projectId: string) {
    return this.prisma.module.findMany({
      where: { projectId },
      include: {
        tasks: { include: { assignee: true, subtasks: { include: { assignee: true, subtasks: true } } } },
        responsibles: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: {
        tasks: { include: { assignee: true, subtasks: { include: { assignee: true } } } },
        responsibles: true,
      },
    });
  }

  async update(id: string, dto: UpdateModuleDto) {
    const { responsibleIds, ...rest } = dto;
    return this.prisma.module.update({
      where: { id },
      data: {
        ...rest as any,
        ...(responsibleIds !== undefined ? {
          responsibles: {
            set: responsibleIds.map(id => ({ id })),
          },
        } : {}),
      },
      include: { responsibles: true },
    });
  }

  async remove(id: string) {
    return this.prisma.module.delete({
      where: { id },
    });
  }
}
