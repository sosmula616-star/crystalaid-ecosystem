"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@crystalaid/database");
const userService_1 = require("../services/userService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'crystalaid_super_secret_jwt_key_live_2026_987654321';
router.post('/discord/token', async (req, res) => {
    try {
        const { code, guildId = '1100000000000000001' } = req.body;
        // Check if guild exists or create fallback
        let guild = await database_1.prisma.guild.findUnique({
            where: { discordGuildId: guildId },
        });
        if (!guild) {
            guild = await database_1.prisma.guild.create({
                data: {
                    discordGuildId: guildId,
                    name: 'CrystalAid Sanctuary',
                    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
                },
            });
        }
        // Default demo user if testing in standalone mode or development
        let targetDiscordId = '1100000000000000099';
        let targetUsername = 'CrystalNovice';
        let targetAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
        // In a live production environment with code exchange:
        if (code && code !== 'MOCK_CODE' && process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_SECRET !== 'crystalaid_discord_client_secret_placeholder') {
            try {
                const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENT_ID || '',
                        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
                        grant_type: 'authorization_code',
                        code,
                    }),
                });
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    const userRes = await fetch('https://discord.com/api/users/@me', {
                        headers: { Authorization: `Bearer ${tokenData.access_token}` },
                    });
                    if (userRes.ok) {
                        const discordUser = await userRes.json();
                        targetDiscordId = discordUser.id;
                        targetUsername = discordUser.username;
                        targetAvatar = discordUser.avatar
                            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                            : targetAvatar;
                    }
                }
            }
            catch (err) {
                console.warn('OAuth2 exchange with Discord API failed, using fallback authenticated session:', err);
            }
        }
        // Ensure user exists in database
        const user = await database_1.prisma.user.upsert({
            where: { discordId: targetDiscordId },
            update: {
                username: targetUsername,
                avatar: targetAvatar,
            },
            create: {
                discordId: targetDiscordId,
                username: targetUsername,
                avatar: targetAvatar,
                coins: 1450,
            },
        });
        // Ensure guild member exists
        await database_1.prisma.guildMember.upsert({
            where: {
                userId_guildId: {
                    userId: user.id,
                    guildId: guild.id,
                },
            },
            update: {},
            create: {
                userId: user.id,
                guildId: guild.id,
                level: 14,
                xp: 7450,
                currentStreak: 5,
                role: 'USER',
                lastDailyClaim: new Date(Date.now() - 25 * 3600 * 1000),
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, discordId: user.discordId, guildId: guild.id }, JWT_SECRET, { expiresIn: '7d' });
        const profile = await userService_1.userService.getProfile(user.id, guild.id);
        return res.json({
            success: true,
            data: {
                token,
                user: profile,
                guild: {
                    id: guild.id,
                    discordGuildId: guild.discordGuildId,
                    name: guild.name,
                    icon: guild.icon,
                    memberCount: 6,
                    xpRateMultiplier: guild.xpRateMultiplier,
                },
            },
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'AUTH_FAILED', message: err.message || 'Authentication failed' },
            timestamp: Date.now(),
        });
    }
});
router.get('/me', auth_1.authGuard, async (req, res) => {
    try {
        const profile = await userService_1.userService.getProfile(req.userId, req.guildId);
        return res.json({
            success: true,
            data: profile,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'PROFILE_FETCH_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map