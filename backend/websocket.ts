import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

let wss: WebSocketServer | null = null;

// Types d'évènements diffusés aux clients connectés.
// Le client n'a pas besoin de traiter chaque type différemment : il peut
// simplement réagir en rechargeant les données concernées.
export type BroadcastEventType =
  | 'RESSOURCE_CREATED'
  | 'RESSOURCE_UPDATED'
  | 'RESSOURCE_DELETED'
  | 'AFFECTATION_CREATED'
  | 'AFFECTATION_UPDATED'
  | 'AFFECTATION_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

// Attache le serveur WebSocket au serveur HTTP existant (même port que l'API).
export function attachWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket: WebSocket) => {
    console.log('🔌 Client WebSocket connecté.');

    socket.on('close', () => {
      console.log('🔌 Client WebSocket déconnecté.');
    });
  });

  console.log('✅ Serveur WebSocket prêt sur le chemin /ws.');
}

// Envoie un évènement à tous les clients connectés (sauf ceux dont le socket
// n'est plus ouvert). Appelé depuis les controllers après chaque écriture en base.
export function broadcast(type: BroadcastEventType, payload?: Record<string, unknown>): void {
  if (!wss) return;

  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}