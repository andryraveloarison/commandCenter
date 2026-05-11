import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.site.findMany({ orderBy: { nom: 'asc' } });
  }

  create(data: { nom: string }) {
    return this.prisma.site.create({ data });
  }

  update(id: string, data: { nom?: string }) {
    return this.prisma.site.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.site.delete({ where: { id } });
  }
}
