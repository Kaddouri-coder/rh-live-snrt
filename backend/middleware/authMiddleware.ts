import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser } from '../../shared/types';

// Valeurs "par défaut" qui ne doivent JAMAIS servir de secret réel.
const INSECURE_DEFAULTS = [
  'change_me_in_env_file',
  'change_this_to_a_long_random_secret',
  'secret',
  'password',
];

const rawSecret = process.env.JWT_SECRET;

if (!rawSecret || rawSecret.length < 32 || INSECURE_DEFAULTS.includes(rawSecret)) {
  throw new Error(
    "JWT_SECRET manquant ou trop faible dans .env. Définissez une clé secrète aléatoire " +
      "d'au moins 32 caractères avant de démarrer le serveur (ex: openssl rand -hex 32)."
  );
}

// Déclaré une seule fois ici, après la validation ci-dessus : garanti non-vide et fort.
const JWT_SECRET: string = rawSecret;

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