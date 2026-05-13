import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

const INCLUDE = {
  intervenants: {
    include: { user: { select: { id: true, nom: true, photo: true, role: true } } },
  },
  demandeur: { include: { site: true } },
  site:      true,
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

  async create(data: {
    probleme: string;
    solution?: string;
    statut?: string;
    dateIntervention?: string;
    intervenantIds?: string[];
    demandeurId?: string;
    siteId?: string;
  }) {
    const { dateIntervention, statut, intervenantIds, ...rest } = data;
    return this.prisma.intervention.create({
      data: {
        ...rest,
        ...(statut && { statut: statut as any }),
        ...(dateIntervention && { dateIntervention: new Date(dateIntervention) }),
        ...(intervenantIds?.length && {
          intervenants: {
            create: intervenantIds.map((userId) => ({ userId })),
          },
        }),
      },
      include: INCLUDE,
    });
  }

  async update(id: string, data: {
    probleme?: string;
    solution?: string;
    statut?: string;
    dateIntervention?: string | null;
    intervenantIds?: string[] | null;
    demandeurId?: string | null;
    siteId?: string | null;
  }) {
    const { dateIntervention, statut, intervenantIds, ...rest } = data;

    return this.prisma.$transaction(async (tx) => {
      if (intervenantIds !== undefined) {
        await tx.interventionIntervenant.deleteMany({ where: { interventionId: id } });
        if (intervenantIds && intervenantIds.length > 0) {
          await tx.interventionIntervenant.createMany({
            data: intervenantIds.map((userId) => ({ interventionId: id, userId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.intervention.update({
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
