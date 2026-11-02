"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const activities_1 = __importDefault(require("./routes/activities"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const rewards_1 = __importDefault(require("./routes/rewards"));
const shop_1 = __importDefault(require("./routes/shop"));
const achievements_1 = __importDefault(require("./routes/achievements"));
const events_1 = __importDefault(require("./routes/events"));
const websocketServer_1 = require("./realtime/websocketServer");
const database_1 = require("@crystalaid/database");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
// Middlewares
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json());
// Basic Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 120, // 120 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded, please slow down your requests.',
        },
        timestamp: Date.now(),
    },
});
app.use('/api', limiter);
// Health Check
app.get(['/health', '/api/health'], async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        dbStatus = 'connected';
    }
    catch (e) {
        dbStatus = `error: ${e.message}`;
    }
    res.json({
        name: 'CrystalAid API Gateway',
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        database: dbStatus,
        timestamp: Date.now(),
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/activities', activities_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/rewards', rewards_1.default);
app.use('/api/shop', shop_1.default);
app.use('/api/achievements', achievements_1.default);
app.use('/api/events', events_1.default);
// Static assets: serve project logo & client build if present
const assetsDir = path_1.default.resolve(__dirname, '../../../assets');
app.use('/assets', express_1.default.static(assetsDir));
const clientDistDir = path_1.default.resolve(__dirname, '../../activity/dist');
app.use(express_1.default.static(clientDistDir));
// Fallback SPA routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
    }
    const indexPath = path_1.default.join(clientDistDir, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // If frontend hasn't been built yet, provide informative landing JSON
            res.status(200).json({
                app: 'CrystalAid Mini App & API Gateway',
                status: 'Online',
                message: 'Frontend is compiling or accessible via development server.',
                endpoints: [
                    '/health',
                    '/api/auth/me',
                    '/api/leaderboard',
                    '/api/rewards/status',
                    '/api/shop/items',
                    '/api/achievements',
                    '/api/events/active',
                ],
            });
        }
    });
});
// Setup WebSocket server
(0, websocketServer_1.setupWebSocketServer)(server);
// Start listening
server.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`💎 CrystalAid Server running on http://${HOST}:${PORT}`);
    console.log(`📡 WebSocket Gateway active on ws://${HOST}:${PORT}/ws`);
    console.log(`🌐 Public Mini App URL: ${process.env.APP_URL || `http://${HOST}:${PORT}`}`);
    console.log(`====================================================`);
});
//# sourceMappingURL=server.js.map