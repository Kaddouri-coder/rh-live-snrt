import { Router } from 'express';
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

// Authentication (public)
router.post('/auth/login', login);

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