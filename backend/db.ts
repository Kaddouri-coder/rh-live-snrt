import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Connexion vers la base PostgreSQL locale (pgAdmin4)
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'snrt_db',
});

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le pool PostgreSQL', err);
});

// Petit helper pour tester rapidement la connexion au démarrage
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connexion PostgreSQL (snrt_db) réussie.');
  } catch (err) {
    console.error('❌ Impossible de se connecter à PostgreSQL :', err);
  }
}
