"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shopService_1 = require("../services/shopService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/items', auth_1.authGuard, async (req, res) => {
    try {
        const catalog = await shopService_1.shopService.getCatalog(req.userId);
        return res.json({
            success: true,
            data: catalog,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'SHOP_CATALOG_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
router.post('/purchase/:itemId', auth_1.authGuard, async (req, res) => {
    try {
        const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
        const result = await shopService_1.shopService.purchaseItem(req.userId, itemId);
        return res.json({
            success: true,
            data: result,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        const code = err.message || 'PURCHASE_FAILED';
        const status = code === 'INSUFFICIENT_FUNDS' ? 400 : code === 'ALREADY_OWNED' ? 409 : 500;
        return res.status(status).json({
            success: false,
            data: null,
            error: { code, message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=shop.js.map