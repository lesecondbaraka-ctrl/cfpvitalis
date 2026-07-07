const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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
    console.log("Comptage des lignes dans les tables existantes :");
    
    const models = ['utilisateur', 'etablissement', 'formation', 'module', 'cours', 'certificat'];
    
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        console.log(`- ${model} : ${count} ligne(s)`);
      } catch (e) {
        console.log(`- ${model} : Erreur (${e.message})`);
      }
    }
  } catch (err) {
    console.error("Erreur générale :", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
