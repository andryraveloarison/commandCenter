import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

const INCLUDE = {
  intervenant: { select: { id: true, nom: true, photo: true, role: true } },
  demandeur:   { include: { site: true } },
  site:        true,
} as const;

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.intervention.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.intervention.findUnique({ where: { id }, include: INCLUDE });
  }

  create(data: {
    probleme: string;
    solution?: string;
    statut?: string;
    dateIntervention?: string;
    intervenantId?: string;
    demandeurId?: string;
    siteId?: string;
  }) {
    const { dateIntervention, statut, ...rest } = data;
    return this.prisma.intervention.create({
      data: {
        ...rest,
        ...(statut && { statut: statut as any }),
        ...(dateIntervention && { dateIntervention: new Date(dateIntervention) }),
      },
      include: INCLUDE,
    });
  }

  update(id: string, data: {
    probleme?: string;
    solution?: string;
    statut?: string;
    dateIntervention?: string | null;
    intervenantId?: string | null;
    demandeurId?: string | null;
    siteId?: string | null;
  }) {
    const { dateIntervention, statut, ...rest } = data;
    return this.prisma.intervention.update({
      where: { id },
      data: {
        ...rest,
        ...(statut && { statut: statut as any }),
        ...(dateIntervention !== undefined && {
          dateIntervention: dateIntervention ? new Date(dateIntervention) : null,
        }),
      },
      include: INCLUDE,
    });
  }

  remove(id: string) {
    return this.prisma.intervention.delete({ where: { id } });
  }

  stats() {
    return Promise.all([
      this.prisma.intervention.count(),
      this.prisma.intervention.count({ where: { statut: 'EN_ATTENTE' } }),
      this.prisma.intervention.count({ where: { statut: 'EN_COURS' } }),
      this.prisma.intervention.count({ where: { statut: 'RESOLU' } }),
    ]).then(([total, enAttente, enCours, resolu]) => ({ total, enAttente, enCours, resolu }));
  }
}
