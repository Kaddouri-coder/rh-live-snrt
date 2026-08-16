import { Router } from 'express';
import {
  getRessources,
  getRessourceById,
  createRessource,
  updateRessource,
  deleteRessource,
} from '../controllers/ressourcesController';
import { getAffectations, createAffectation } from '../controllers/affectationsController';
import { checkDisponibilite } from '../controllers/disponibiliteController';
import { getFonctionsConfig, updateFonctionsConfig } from '../controllers/fonctionsController';
import { getSyncStatus, triggerSync, getStats } from '../controllers/syncController';
import { getReferentiels } from '../controllers/referentielsController';

const router = Router();

// Resources
router.get('/ressources', getRessources);
router.post('/ressources', createRessource);
router.get('/ressources/:id', getRessourceById);
router.put('/ressources/:id', updateRessource);
router.delete('/ressources/:id', deleteRessource);

// Affectations
router.get('/affectations', getAffectations);
router.post('/affectations', createAffectation);

// Availability search
router.post('/disponibilite', checkDisponibilite);

// Displayed HR functions configuration
router.get('/fonctions', getFonctionsConfig);
router.put('/fonctions', updateFonctionsConfig);

// Synchronization & Statistics
router.get('/sync', getSyncStatus);
router.post('/sync/trigger', triggerSync);
router.get('/stats', getStats);

// Referentiels metadata
router.get('/referentiels', getReferentiels);

export default router;
