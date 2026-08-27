import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.utilisateur.findMany({
    select: { id: true, email: true, nom: true, prenom: true, role: true, actif: true, etablissementId: true },
  });
  console.log('USERS_FOUND:', JSON.stringify(users, null, 2));

  const formations = await prisma.formation.findMany({
    select: { id: true, titre: true, etablissementId: true },
  });
  console.log('FORMATIONS_FOUND:', JSON.stringify(formations, null, 2));
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
