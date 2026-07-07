const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const formations = await prisma.formation.findMany();
    console.log("Formations en base :");
    console.log(JSON.stringify(formations, null, 2));

    const etablissements = await prisma.etablissement.findMany();
    console.log("\nEtablissements en base :");
    console.log(JSON.stringify(etablissements, null, 2));
  } catch (err) {
    console.error("Erreur :", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
