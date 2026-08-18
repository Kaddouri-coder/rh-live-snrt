import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser } from '../../shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env_file';

export interface AuthenticatedRequest extends Request {
  user?: AppUser;
}

export function generateToken(user: AppUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AppUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}