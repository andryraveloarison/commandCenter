import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateModuleDto) {
    return this.prisma.module.create({
      data: {
        projectId: dto.projectId,
        nom: dto.nom,
        description: dto.description,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.module.findMany({
      where: { projectId },
      include: { tasks: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  async update(id: string, dto: UpdateModuleDto) {
    return this.prisma.module.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.module.delete({
      where: { id },
    });
  }
}
