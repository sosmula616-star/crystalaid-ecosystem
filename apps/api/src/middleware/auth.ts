import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'crystalaid_super_secret_jwt_key_live_2026_987654321';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  guildId?: string;
  discordId?: string;
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; discordId: string };
    req.userId = decoded.userId;
    req.discordId = decoded.discordId;

    const guildIdHeader = req.headers['x-guild-id'];
    req.guildId = Array.isArray(guildIdHeader) ? guildIdHeader[0] : (guildIdHeader as string) || '1100000000000000001';

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: 'INVALID_TOKEN', message: 'Token is expired or invalid' },
      timestamp: Date.now(),
    });
  }
}
