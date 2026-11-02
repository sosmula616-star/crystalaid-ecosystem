"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'crystalaid_super_secret_jwt_key_live_2026_987654321';
function authGuard(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            data: null,
            error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
            timestamp: Date.now(),
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.discordId = decoded.discordId;
        const guildIdHeader = req.headers['x-guild-id'];
        req.guildId = Array.isArray(guildIdHeader) ? guildIdHeader[0] : guildIdHeader || '1100000000000000001';
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            data: null,
            error: { code: 'INVALID_TOKEN', message: 'Token is expired or invalid' },
            timestamp: Date.now(),
        });
    }
}
//# sourceMappingURL=auth.js.map