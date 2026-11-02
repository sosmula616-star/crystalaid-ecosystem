"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const index_1 = require("./index");
const config_1 = require("@crystalaid/config");
async function seedDatabase() {
    console.log('💎 Starting CrystalAid database seeding on PostgreSQL...');
    // 1. Seed or update Guild
    const guild = await index_1.prisma.guild.upsert({
        where: { discordGuildId: '1100000000000000001' },
        update: {
            name: 'CrystalAid Sanctuary',
            icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
        },
        create: {
            discordGuildId: '1100000000000000001',
            name: 'CrystalAid Sanctuary',
            icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
            xpRateMultiplier: 1.0,
            settings: JSON.stringify({
                primaryChannelId: '1100000000000000010',
                allowedRoles: ['Member', 'Vanguard', 'Admin'],
            }),
        },
    });
    console.log(`✅ Guild ensured: ${guild.name} (${guild.id})`);
    // 2. Seed Achievements
    for (const ach of config_1.DEFAULT_ACHIEVEMENTS) {
        await index_1.prisma.achievement.upsert({
            where: { code: ach.code },
            update: {
                name: ach.name,
                description: ach.description,
                category: ach.category,
                rarity: ach.rarity,
                icon: ach.icon,
                xpReward: ach.xpReward,
                coinReward: ach.coinReward,
                maxProgress: ach.maxProgress,
            },
            create: {
                code: ach.code,
                name: ach.name,
                description: ach.description,
                category: ach.category,
                rarity: ach.rarity,
                icon: ach.icon,
                xpReward: ach.xpReward,
                coinReward: ach.coinReward,
                maxProgress: ach.maxProgress,
            },
        });
    }
    console.log(`✅ Seeded ${config_1.DEFAULT_ACHIEVEMENTS.length} Achievements`);
    // 3. Seed Shop Items
    for (const item of config_1.DEFAULT_SHOP_ITEMS) {
        await index_1.prisma.shopItem.upsert({
            where: { code: item.code },
            update: {
                name: item.name,
                description: item.description,
                category: item.category,
                rarity: item.rarity,
                price: item.price,
                previewUrl: item.previewUrl,
                metadata: JSON.stringify(item.metadata || {}),
                isAvailable: true,
            },
            create: {
                code: item.code,
                name: item.name,
                description: item.description,
                category: item.category,
                rarity: item.rarity,
                price: item.price,
                previewUrl: item.previewUrl,
                metadata: JSON.stringify(item.metadata || {}),
                isAvailable: true,
            },
        });
    }
    console.log(`✅ Seeded ${config_1.DEFAULT_SHOP_ITEMS.length} Shop Catalog Items`);
    // 4. Seed Demo Users for Leaderboard and Interaction
    const demoUsersData = [
        {
            discordId: '1100000000000000001',
            username: 'Astraea',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            equippedFrame: 'FRAME_APEX',
            equippedBadge: 'BADGE_SUPERNOVA',
            level: 42,
            xp: 68420,
            streak: 24,
            coins: 4500,
            role: 'ADMIN',
        },
        {
            discordId: '1100000000000000002',
            username: 'Kaelen_Void',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            equippedFrame: 'FRAME_VIOLET',
            equippedBadge: 'BADGE_RESONATOR',
            level: 38,
            xp: 54100,
            streak: 18,
            coins: 2900,
            role: 'MODERATOR',
        },
        {
            discordId: '1100000000000000003',
            username: 'Vespera_99',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            equippedFrame: 'FRAME_ICE',
            equippedBadge: 'BADGE_RESONATOR',
            level: 31,
            xp: 38900,
            streak: 14,
            coins: 1850,
            role: 'USER',
        },
        {
            discordId: '1100000000000000004',
            username: 'ZephyrPulse',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            equippedFrame: null,
            equippedBadge: null,
            level: 26,
            xp: 25400,
            streak: 9,
            coins: 1200,
            role: 'USER',
        },
        {
            discordId: '1100000000000000005',
            username: 'NyxCipher',
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            equippedFrame: 'FRAME_ICE',
            equippedBadge: null,
            level: 21,
            xp: 16800,
            streak: 7,
            coins: 950,
            role: 'USER',
        },
        {
            discordId: '1100000000000000099', // Default logged-in user for standalone demo
            username: 'CrystalNovice',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            equippedFrame: 'FRAME_ICE',
            equippedBadge: 'BADGE_RESONATOR',
            level: 14,
            xp: 7450,
            streak: 5,
            coins: 1450,
            role: 'USER',
        },
    ];
    for (const u of demoUsersData) {
        const user = await index_1.prisma.user.upsert({
            where: { discordId: u.discordId },
            update: {
                username: u.username,
                avatar: u.avatar,
                equippedFrame: u.equippedFrame,
                equippedBadge: u.equippedBadge,
                coins: u.coins,
            },
            create: {
                discordId: u.discordId,
                username: u.username,
                avatar: u.avatar,
                equippedFrame: u.equippedFrame,
                equippedBadge: u.equippedBadge,
                coins: u.coins,
            },
        });
        await index_1.prisma.guildMember.upsert({
            where: {
                userId_guildId: {
                    userId: user.id,
                    guildId: guild.id,
                },
            },
            update: {
                level: u.level,
                xp: u.xp,
                currentStreak: u.streak,
                role: u.role,
            },
            create: {
                userId: user.id,
                guildId: guild.id,
                level: u.level,
                xp: u.xp,
                currentStreak: u.streak,
                role: u.role,
                lastDailyClaim: new Date(Date.now() - 25 * 3600 * 1000), // Available to claim
            },
        });
    }
    console.log(`✅ Seeded ${demoUsersData.length} Members and Leaderboard standings`);
    // 5. Seed Community Event
    const activeEvent = await index_1.prisma.guildEvent.findFirst({
        where: { guildId: guild.id },
    });
    if (!activeEvent) {
        await index_1.prisma.guildEvent.create({
            data: {
                guildId: guild.id,
                title: config_1.DEFAULT_COMMUNITY_EVENT.title,
                description: config_1.DEFAULT_COMMUNITY_EVENT.description,
                type: config_1.DEFAULT_COMMUNITY_EVENT.type,
                targetXp: config_1.DEFAULT_COMMUNITY_EVENT.targetXp,
                currentXp: config_1.DEFAULT_COMMUNITY_EVENT.currentXp,
                startsAt: new Date(config_1.DEFAULT_COMMUNITY_EVENT.startsAt),
                endsAt: new Date(config_1.DEFAULT_COMMUNITY_EVENT.endsAt),
                rewardsJson: JSON.stringify(config_1.DEFAULT_COMMUNITY_EVENT.rewards),
            },
        });
        console.log(`✅ Seeded Guild Community Event: ${config_1.DEFAULT_COMMUNITY_EVENT.title}`);
    }
    console.log('🎉 CrystalAid database seeding completed successfully!');
}
if (require.main === module) {
    seedDatabase()
        .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
        .finally(async () => {
        await index_1.prisma.$disconnect();
    });
}
//# sourceMappingURL=seed.js.map