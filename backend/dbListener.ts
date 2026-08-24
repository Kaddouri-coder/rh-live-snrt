import { Client } from 'pg';
import dotenv from 'dotenv';
import { broadcast } from './websocket';

dotenv.config();

// Ce module écoute les changements en base de données au niveau de PostgreSQL
// lui-même (via LISTEN/NOTIFY), et pas seulement ceux qui passent par notre
// API. Ainsi, même une modification faite directement dans pgAdmin (ou plus
// tard par le vrai système mPlannerV2 s'il écrit dans la même base) déclenche
// une mise à jour en temps réel côté clients connectés.
//
// Nécessite une connexion PostgreSQL DÉDIÉE (pas le pool), car LISTEN doit
// rester ouvert en continu sur une seule connexion.

let listenerClient: Client | null = null;

export async function startDbListener(): Promise<void> {
  listenerClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snrt_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await listenerClient.connect();
    await listenerClient.query('LISTEN data_changes');

    listenerClient.on('notification', (msg) => {
      if (!msg.payload) return;
      try {
        const data = JSON.parse(msg.payload);
        broadcast('DB_CHANGE', data);
        console.log(`📣 Changement détecté en base : ${data.table} (${data.action})`);
      } catch (err) {
        console.error('Erreur lors du parsing de la notification PostgreSQL :', err);
      }
    });

    listenerClient.on('error', (err) => {
      console.error('❌ Erreur sur la connexion LISTEN PostgreSQL :', err);
    });

    console.log('✅ Écoute des changements PostgreSQL (LISTEN/NOTIFY) active.');
  } catch (err) {
    console.error('❌ Impossible de démarrer le listener PostgreSQL (LISTEN/NOTIFY) :', err);
    console.error(
      '   Astuce : avez-vous bien créé les triggers SQL (notify_data_change) sur vos tables ?'
    );
  }
}