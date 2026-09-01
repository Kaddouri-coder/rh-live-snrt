import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getRessources,
  getRessourceById,
  updateRessource,
  deleteRessource,
} from '../controllers/ressourcesController';
import { getAffectations } from '../controllers/affectationsController';
import { checkDisponibilite } from '../controllers/disponibiliteController';
import { getFonctionsConfig, updateFonctionsConfig } from '../controllers/fonctionsController';
import { getStats } from '../controllers/syncController';
import { getReferentiels } from '../controllers/referentielsController';
import { login } from '../controllers/authController';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Anti brute-force sur la connexion : 5 tentatives max par IP toutes les 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Garde-fou général contre les abus sur l'ensemble de l'API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(apiLimiter);

// Authentication (public)
router.post('/auth/login', loginLimiter, login);

// Everything below requires a valid session
router.use(requireAuth);

// Users administration (admin only)
router.get('/users', requireAdmin, getUsers);
router.post('/users', requireAdmin, createUser);
router.put('/users/:id', requireAdmin, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);

// Resources
router.get('/ressources', getRessources);
router.get('/ressources/:id', getRessourceById);
router.put('/ressources/:id', updateRessource);
router.delete('/ressources/:id', deleteRessource);

// Affectations
router.get('/affectations', getAffectations);

// Availability search
router.post('/disponibilite', checkDisponibilite);

// Displayed HR functions configuration
router.get('/fonctions', getFonctionsConfig);
router.put('/fonctions', updateFonctionsConfig);

// Statistics
router.get('/stats', getStats);

// Referentiels metadata
router.get('/referentiels', getReferentiels);

export default router;