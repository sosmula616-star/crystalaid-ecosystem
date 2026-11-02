import http from 'http';
import type { WsServerMessage } from '@crystalaid/types';
export declare function setupWebSocketServer(server: http.Server): import("ws").Server<typeof import("ws"), typeof http.IncomingMessage>;
export declare function broadcastToGuild(guildId: string, message: WsServerMessage): void;
//# sourceMappingURL=websocketServer.d.ts.map