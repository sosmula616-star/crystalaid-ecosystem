import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { WsServerMessage } from '@crystalaid/types';

interface ClientConnection {
  ws: WebSocket;
  guildId?: string;
  userId?: string;
  isAlive: boolean;
}

const clients = new Map<WebSocket, ClientConnection>();

export function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const connection: ClientConnection = {
      ws,
      isAlive: true,
    };
    clients.set(ws, connection);

    // Initial greeting
    const welcome: WsServerMessage = {
      type: 'CONNECTED',
      connectionId: Math.random().toString(36).substring(2, 9),
    };
    ws.send(JSON.stringify(welcome));

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.type === 'SUBSCRIBE') {
          connection.guildId = payload.guildId;
          // Send simulated active participants
          ws.send(
            JSON.stringify({
              type: 'PARTICIPANTS_UPDATE',
              participants: [
                {
                  id: 'u1',
                  username: 'Astraea',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  level: 42,
                  joinedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                },
                {
                  id: 'u2',
                  username: 'Kaelen_Void',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                  level: 38,
                  joinedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
                },
                {
                  id: 'u3',
                  username: 'CrystalNovice (You)',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  level: 14,
                  joinedAt: new Date().toISOString(),
                },
              ],
            })
          );
        } else if (payload.type === 'PONG') {
          connection.isAlive = true;
        }
      } catch (err) {
        console.warn('Malformed WS message received:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('WebSocket client error:', err);
      clients.delete(ws);
    });
  });

  // Heartbeat interval to prune dead sockets
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const conn = clients.get(ws);
      if (!conn || !conn.isAlive) {
        ws.terminate();
        clients.delete(ws);
        return;
      }
      conn.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('⚡ CrystalAid WebSocket server initialized on path /ws');
  return wss;
}

export function broadcastToGuild(guildId: string, message: WsServerMessage) {
  const json = JSON.stringify(message);
  clients.forEach((conn) => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      if (!conn.guildId || conn.guildId === guildId) {
        conn.ws.send(json);
      }
    }
  });
}
