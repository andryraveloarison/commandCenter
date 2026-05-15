import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';

const INCLUDE = {
  intervenants: {
    include: { user: { select: { id: true, nom: true, photo: true, role: true } } },
  },
  demandeur: { include: { site: true } },
  site:      true,
} as const;

@Injectable()
export class InterventionsService {
  constructor(private prisma: PrismaService, private chat: ChatGateway) {}

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
    const intervention = await this.prisma.intervention.create({
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
    this.chat.emitToAll('intervention:created', {
      interventionId: intervention.id,
      probleme: intervention.probleme,
    });
    return intervention;
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

      const updated = await tx.intervention.update({
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

      this.chat.emitToAll('intervention:updated', {
        interventionId: updated.id,
        probleme: updated.probleme,
        statut: updated.statut,
      });

      return updated;
    });
  }

  async remove(id: string) {
    const item = await this.prisma.intervention.findUnique({ where: { id }, select: { probleme: true } });
    const deleted = await this.prisma.intervention.delete({ where: { id } });
    this.chat.emitToAll('intervention:deleted', { interventionId: id, probleme: item?.probleme ?? '' });
    return deleted;
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
