import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDemo: boolean = process.env.SEED_DEMO === 'true';
// Par défaut, le seeding de démonstration est désactivé.
// L'application travaille avec vos données réelles stockées dans la base PostgreSQL.

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Demarrage du seeder Vitalis Center... SEED_DEMO=${seedDemo}`);

  if (!seedDemo) {
    console.log('SEED_DEMO non activé — saut du seeding de démonstration.');
    return;
  }

  const siegeSocial = await prisma.etablissement.upsert({
    where: { codeAntenne: 'SIEGE-PARIS' },
    update: {},
    create: {
      codeAntenne: 'SIEGE-PARIS',
      nom: 'Vitalis Center - Siege Social',
      adresse: '12 Avenue de la Formation, 75001 Paris',
    },
  });

  const antenneLyon = await prisma.etablissement.upsert({
    where: { codeAntenne: 'ANTENNE-LYON' },
    update: {},
    create: {
      codeAntenne: 'ANTENNE-LYON',
      nom: 'Vitalis Center - Antenne Lyon',
      adresse: '8 Rue des Apprentis, 69001 Lyon',
    },
  });

  const passwordHash = await bcrypt.hash('Vitalis2025!', 12);

  const adminCentre = await prisma.utilisateur.upsert({
    where: { email: 'admin@vitalis-center.fr' },
    update: {},
    create: {
      email: 'admin@vitalis-center.fr',
      password: passwordHash,
      nom: 'Dupont',
      prenom: 'Marie',
      role: 'ADMIN_CENTRE',
      etablissementId: siegeSocial.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'admin.lyon@vitalis-center.fr' },
    update: {},
    create: {
      email: 'admin.lyon@vitalis-center.fr',
      password: passwordHash,
      nom: 'Martin',
      prenom: 'Pierre',
      role: 'ADMIN_ETABLISSEMENT',
      etablissementId: antenneLyon.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'apprenant.lyon@vitalis-center.fr' },
    update: {},
    create: {
      email: 'apprenant.lyon@vitalis-center.fr',
      password: passwordHash,
      nom: 'Moreau',
      prenom: 'Julie',
      role: 'APPRENANT',
      etablissementId: antenneLyon.id,
    },
  });

  const formationLyon = await prisma.formation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      titre: 'Formation DevOps — Antenne Lyon',
      description: 'CI/CD et conteneurisation pour l\'antenne Lyon.',
      etablissementId: antenneLyon.id,
    },
  });

  await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      titre: 'Docker & Kubernetes',
      ordre: 1,
      formationId: formationLyon.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'formateur@vitalis-center.fr' },
    update: {},
    create: {
      email: 'formateur@vitalis-center.fr',
      password: passwordHash,
      nom: 'Bernard',
      prenom: 'Sophie',
      role: 'FORMATEUR',
      etablissementId: siegeSocial.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'apprenant@vitalis-center.fr' },
    update: {},
    create: {
      email: 'apprenant@vitalis-center.fr',
      password: passwordHash,
      nom: 'Lefevre',
      prenom: 'Thomas',
      role: 'APPRENANT',
      etablissementId: siegeSocial.id,
    },
  });

  await prisma.utilisateur.upsert({
    where: { email: 'personnel@vitalis-center.fr' },
    update: {},
    create: {
      email: 'personnel@vitalis-center.fr',
      password: passwordHash,
      nom: 'Durand',
      prenom: 'Claire',
      role: 'PERSONNEL_ADMINISTRATIF',
      etablissementId: siegeSocial.id,
    },
  });

  const formation = await prisma.formation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      titre: 'Formation NestJS & Angular',
      description: 'Developpement Full-Stack moderne.',
      etablissementId: siegeSocial.id,
    },
  });

  const module1 = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      titre: 'Introduction a NestJS',
      ordre: 1,
      formationId: formation.id,
    },
  });

  const module2 = await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      titre: 'Angular 18',
      ordre: 2,
      formationId: formation.id,
    },
  });

  await prisma.module.upsert({
    where: { id: '00000000-0000-0000-0000-000000000013' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000013',
      titre: 'DevOps',
      ordre: 3,
      formationId: formation.id,
    },
  });

  const cours1 = await prisma.cours.upsert({
    where: { id: '00000000-0000-0000-0000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000101',
      titre: 'Architecture NestJS',
      contenu: 'Les fondamentaux de NestJS.',
      moduleId: module1.id,
    },
  });

  await prisma.cours.upsert({
    where: { id: '00000000-0000-0000-0000-000000000102' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000102',
      titre: 'Controllers et Services',
      contenu: 'Gestion des requetes.',
      moduleId: module1.id,
    },
  });

  await prisma.cours.upsert({
    where: { id: '00000000-0000-0000-0000-000000000103' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000103',
      titre: 'Composants Standalone',
      contenu: 'Angular 18 sans NgModule.',
      moduleId: module2.id,
    },
  });

  await prisma.evaluation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000201',
      titre: 'Quiz NestJS',
      noteMaximale: 20,
      moduleId: module1.id,
    },
  });

  await prisma.evaluation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000202' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000202',
      titre: 'Quiz Angular',
      noteMaximale: 20,
      moduleId: module2.id,
    },
  });

  const formateur = await prisma.utilisateur.findUnique({ where: { email: 'formateur@vitalis-center.fr' } });
  const apprenant = await prisma.utilisateur.findUnique({ where: { email: 'apprenant@vitalis-center.fr' } });

  const seance = await prisma.seanceFormation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000301',
      moduleId: module1.id,
      coursId: cours1.id,
      formateurId: formateur!.id,
      titreActivite: 'Cours magistral NestJS',
      typeSession: 'THEORIQUE',
      dateHeureDebut: new Date('2026-07-15T09:00:00Z'),
      dateHeureFin: new Date('2026-07-15T12:00:00Z'),
      salleOuLien: 'Salle A — Paris',
    },
  });

  if (apprenant) {
    await prisma.presenceSeance.upsert({
      where: { seanceId_utilisateurId: { seanceId: seance.id, utilisateurId: apprenant.id } },
      update: {},
      create: { seanceId: seance.id, utilisateurId: apprenant.id, statut: 'PRESENT' },
    });
  }

  const quiz1 = await prisma.quiz.upsert({
    where: { id: '00000000-0000-0000-0000-000000000401' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000401',
      moduleId: module1.id,
      titre: 'Quiz NestJS — Fondamentaux',
      dureeMinutes: 15,
    },
  });

  await prisma.questionQuiz.upsert({
    where: { id: '00000000-0000-0000-0000-000000000411' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000411',
      quizId: quiz1.id,
      enonce: 'Quel décorateur NestJS définit un contrôleur ?',
      ordre: 1,
      options: [
        { text: '@Controller()', correct: true },
        { text: '@Service()', correct: false },
        { text: '@Module()', correct: false },
      ],
    },
  });

  await prisma.questionQuiz.upsert({
    where: { id: '00000000-0000-0000-0000-000000000412' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000412',
      quizId: quiz1.id,
      enonce: 'Quel module gère l\'injection de dépendances ?',
      ordre: 2,
      options: [
        { text: 'Core', correct: true },
        { text: 'HttpModule', correct: false },
        { text: 'ConfigModule', correct: false },
      ],
    },
  });

  const devoir1 = await prisma.devoir.upsert({
    where: { id: '00000000-0000-0000-0000-000000000501' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000501',
      moduleId: module1.id,
      titre: 'TP — API REST NestJS',
      consignes: 'Créer une API CRUD simple avec NestJS et documenter les endpoints.',
      dateLimite: new Date('2026-12-31T23:59:59Z'),
    },
  });

  await prisma.devoir.upsert({
    where: { id: '00000000-0000-0000-0000-000000000502' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000502',
      moduleId: module2.id,
      titre: 'Projet Angular — Composant standalone',
      consignes: 'Développer un composant standalone avec routing et formulaires réactifs.',
      dateLimite: new Date('2026-12-31T23:59:59Z'),
    },
  });

  await prisma.auditLog.create({
    data: {
      auteurId: adminCentre.id,
      action: 'INITIALISATION_SYSTEME',
      details: { message: 'Init BDD Vitalis Center EUP' },
      ipAdresse: '127.0.0.1',
    },
  });

  console.log('Seeder termine avec succes!');
}

main()
  .catch((e) => {
    console.error('Erreur seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
