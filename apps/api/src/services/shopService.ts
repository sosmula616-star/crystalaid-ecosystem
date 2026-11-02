import { prisma } from '@crystalaid/database';
import { ShopCatalogItem, ShopCategory, Rarity } from '@crystalaid/types';

export const shopService = {
  getCatalog: async (userId: string): Promise<ShopCatalogItem[]> => {
    const [items, user, inventory] = await Promise.all([
      prisma.shopItem.findMany({ where: { isAvailable: true } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.inventoryItem.findMany({ where: { userId } }),
    ]);

    const ownedItemIds = new Set(inventory.map((inv) => inv.itemId));

    return items.map((item) => {
      let metadata: any = {};
      try {
        metadata = JSON.parse(item.metadata || '{}');
      } catch (e) {}

      const isOwned = ownedItemIds.has(item.id);
      const isEquipped =
        user?.equippedFrame === item.code ||
        user?.equippedBadge === item.code;

      return {
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
        category: item.category as ShopCategory,
        rarity: item.rarity as Rarity,
        price: item.price,
        previewUrl: item.previewUrl,
        metadata,
        isOwned,
        isEquipped,
      };
    });
  },

  purchaseItem: async (userId: string, itemId: string) => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('USER_NOT_FOUND');

      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      if (!item || !item.isAvailable) throw new Error('ITEM_NOT_FOUND');

      // Duplicate prevention
      const existing = await tx.inventoryItem.findUnique({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
      });
      if (existing) throw new Error('ALREADY_OWNED');

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
