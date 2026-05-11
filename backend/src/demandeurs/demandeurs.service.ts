import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DemandeursService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.demandeur.findMany({
      include: { site: true },
      orderBy: { nom: 'asc' },
    });
  }

  create(data: { nom: string; siteId?: string }) {
    return this.prisma.demandeur.create({ data, include: { site: true } });
  }

  update(id: string, data: { nom?: string; siteId?: string }) {
    return this.prisma.demandeur.update({ where: { id }, data, include: { site: true } });
  }

  remove(id: string) {
    return this.prisma.demandeur.delete({ where: { id } });
  }
}
