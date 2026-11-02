"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopService = void 0;
const database_1 = require("@crystalaid/database");
exports.shopService = {
    getCatalog: async (userId) => {
        const [items, user, inventory] = await Promise.all([
            database_1.prisma.shopItem.findMany({ where: { isAvailable: true } }),
            database_1.prisma.user.findUnique({ where: { id: userId } }),
            database_1.prisma.inventoryItem.findMany({ where: { userId } }),
        ]);
        const ownedItemIds = new Set(inventory.map((inv) => inv.itemId));
        return items.map((item) => {
            let metadata = {};
            try {
                metadata = JSON.parse(item.metadata || '{}');
            }
            catch (e) { }
            const isOwned = ownedItemIds.has(item.id);
            const isEquipped = user?.equippedFrame === item.code ||
                user?.equippedBadge === item.code;
            return {
                id: item.id,
                code: item.code,
                name: item.name,
                description: item.description,
                category: item.category,
                rarity: item.rarity,
                price: item.price,
                previewUrl: item.previewUrl,
                metadata,
                isOwned,
                isEquipped,
            };
        });
    },
    purchaseItem: async (userId, itemId) => {
        return await database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new Error('USER_NOT_FOUND');
            const item = await tx.shopItem.findUnique({ where: { id: itemId } });
            if (!item || !item.isAvailable)
                throw new Error('ITEM_NOT_FOUND');
            // Duplicate prevention
            const existing = await tx.inventoryItem.findUnique({
                where: {
                    userId_itemId: {
                        userId,
                        itemId,
                    },
                },
            });
            if (existing)
                throw new Error('ALREADY_OWNED');
            // Balance check
            if (user.coins < item.price) {
                throw new Error('INSUFFICIENT_FUNDS');
            }
            // Deduct balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    coins: { decrement: item.price },
                },
            });
            // Grant inventory item
            await tx.inventoryItem.create({
                data: {
                    userId,
                    itemId,
                },
            });
            // Record transaction
            await tx.transaction.create({
                data: {
                    userId,
                    type: 'SHOP_PURCHASE',
                    amount: -item.price,
                    description: `Purchased cosmetic: ${item.name} (${item.code})`,
                },
            });
            return {
                success: true,
                remainingCoins: updatedUser.coins,
                purchasedItem: {
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    category: item.category,
                },
            };
        });
    },
};
//# sourceMappingURL=shopService.js.map