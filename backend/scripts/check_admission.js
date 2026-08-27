const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const filieres = await pool.query('SELECT * FROM filieres');
    const niveaux = await pool.query('SELECT * FROM niveaux');
    const sessions = await pool.query('SELECT * FROM sessions_admission');
    const reseau = await pool.query('SELECT * FROM parametres_reseau');
    const candidatures = await pool.query('SELECT * FROM candidatures');

    console.log('--- RESEAU ---', reseau.rows);
    console.log('--- FILIERES (' + filieres.rows.length + ') ---', filieres.rows);
    console.log('--- NIVEAUX (' + niveaux.rows.length + ') ---', niveaux.rows);
    console.log('--- SESSIONS (' + sessions.rows.length + ') ---', sessions.rows);
    console.log('--- CANDIDATURES (' + candidatures.rows.length + ') ---', candidatures.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
