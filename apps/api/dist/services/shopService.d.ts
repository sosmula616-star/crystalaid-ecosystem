import type { ShopCatalogItem } from '@crystalaid/types';
export declare const shopService: {
    getCatalog: (userId: string) => Promise<ShopCatalogItem[]>;
    purchaseItem: (userId: string, itemId: string) => Promise<{
        success: boolean;
        remainingCoins: number;
        purchasedItem: {
            id: string;
            name: string;
            code: string;
            category: string;
        };
    }>;
};
//# sourceMappingURL=shopService.d.ts.map