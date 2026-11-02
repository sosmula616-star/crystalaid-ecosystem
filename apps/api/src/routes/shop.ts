import { Router } from 'express';
import { shopService } from '../services/shopService';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/items', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const catalog = await shopService.getCatalog(req.userId!);
    return res.json({
      success: true,
      data: catalog,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SHOP_CATALOG_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

router.post('/purchase/:itemId', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    const result = await shopService.purchaseItem(req.userId!, itemId);
    return res.json({
      success: true,
      data: result,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
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

export default router;
