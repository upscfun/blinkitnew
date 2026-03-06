import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { fail } from '../utils/response';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 'Unauthorized', 401);
  }
  try {
    req.user = verifyToken(header.slice(7));
    return next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return fail(res, 'Forbidden: admin only', 403);
  }
  return next();
}
