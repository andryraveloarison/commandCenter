import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed (DSI Mode)...');

  // Clear existing data
  await prisma.projectHistory.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.projectTeam.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users with new roles
  const dsi = await prisma.user.create({
    data: {
      email: 'general@command.mil',
      username: 'general_command',
      password: await bcrypt.hash('password123', 10),
      nom: 'DSI Principal',
      role: 'DSI',
      statut: 'ACTIF',
    },
  });

  const responsable = await prisma.user.create({
    data: {
      email: 'colonel@command.mil',
      username: 'colonel_lead',
      password: await bcrypt.hash('password123', 10),
      nom: 'Responsable Technique',
      role: 'RESPONSABLE',
      statut: 'ACTIF',
    },
  });

  const developers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'soldier1@command.mil',
        username: 'soldier_alpha',
        password: await bcrypt.hash('password123', 10),
        nom: 'Alpha Dev',
        role: 'DEVELOPPEUR',
        statut: 'ACTIF',
      },
    }),
    prisma.user.create({
      data: {
        email: 'soldier2@command.mil',
        username: 'soldier_bravo',
        password: await bcrypt.hash('password123', 10),
        nom: 'Bravo Dev',
        role: 'DEVELOPPEUR',
        statut: 'OCCUPE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'soldier3@command.mil',
        username: 'soldier_charlie',
        password: await bcrypt.hash('password123', 10),
        nom: 'Charlie Informaticien',
        role: 'DEVELOPPEUR',
        statut: 'ACTIF',
      },
    }),
  ]);

  // Create projects
  const projectA = await prisma.project.create({
    data: {
      nom: 'Modernisation Core ERP',
      description: 'Refonte complète de l\'architecture backend et optimisation des flux de données.',
      statut: 'EN_COURS',
      priorite: 'CRITIQUE',
      dateDebut: new Date('2026-05-01'),
      dateFin: new Date('2026-08-31'),
      progressionGlobale: 50,
    },
  });

  // Create modules for Project A
  const module1 = await prisma.module.create({
    data: {
      projectId: projectA.id,
      nom: 'Infrastructure & DevOps',
      description: 'Mise en place de CI/CD et environnements cloud.',
      progression: 60,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      projectId: projectA.id,
      nom: 'API Gateway',
      description: 'Développement de la couche d\'accès aux données.',
      progression: 40,
    },
  });

  // Create tasks for modules
  await prisma.task.create({
    data: {
      projectId: projectA.id,
      moduleId: module1.id,
      titre: 'Configuration Terraform',
      description: 'Infrastructure as Code pour AWS.',
      progression: 100,
      statut: 'COMPLETEE',
      priorite: 'HAUTE',
      assigneeId: developers[0].id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: projectA.id,
      moduleId: module1.id,
      titre: 'Pipeline Jenkins',
      description: 'Automatisation des déploiements.',
      progression: 20,
      statut: 'EN_COURS',
      priorite: 'MOYENNE',
      assigneeId: developers[1].id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: projectA.id,
      moduleId: module2.id,
      titre: 'Authentification JWT',
      description: 'Sécurisation des endpoints.',
      progression: 40,
      statut: 'EN_COURS',
      priorite: 'CRITIQUE',
      assigneeId: developers[2].id,
    },
  });

  // Project history
  const dates = [
    new Date('2026-05-01'),
    new Date('2026-05-05'),
    new Date('2026-05-10'),
    new Date('2026-05-15'),
  ];

  for (let j = 0; j < dates.length; j++) {
    await prisma.projectHistory.create({
      data: {
        projectId: projectA.id,
        userId: responsable.id,
        progression: (j + 1) * 12.5,
        note: `Mise à jour hebdomadaire - Phase ${j + 1} validée`,
        createdAt: dates[j],
      },
    });
  }

  // Team association
  await prisma.projectTeam.create({ data: { projectId: projectA.id, userId: responsable.id, role: 'Chef de Projet' } });
  for (const dev of developers) {
    await prisma.projectTeam.create({ data: { projectId: projectA.id, userId: dev.id, role: 'Développeur' } });
  }

  console.log('Database seed completed successfully! ✓');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
