import { Request, Response } from 'express';
import { RessourceModel } from '../models/RessourceModel';
import { AffectationModel } from '../models/AffectationModel';
import { SyncModel } from '../models/SyncModel';
import { FonctionModel } from '../models/FonctionModel';   // zid had l'import

export const getRessources = async (req: Request, res: Response) => {
  const ressources = await RessourceModel.getAll();
  res.json(ressources);
};

export const getRessourceById = async (req: Request, res: Response) => {
  const ressource = await RessourceModel.getById(req.params.id);
  if (!ressource) {
    return res.status(404).json({ error: 'Ressource non trouvée' });
  }

  const affectations = await AffectationModel.getByResourceId(req.params.id);
  res.json({
    ressource,
    affectations,
  });
};

export const createRessource = async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.nom || !data.prenom || !data.fonction || !data.chaineRattachement) {
    return res.status(400).json({ error: 'Champs requis manquants (nom, prenom, fonction, chaineRattachement)' });
  }

  const newRes = await RessourceModel.create(data);
  await FonctionModel.ensureFonctionVisible(newRes.fonction);   // <-- zid had l'ligne
  SyncModel.addLog(`Nouvel agent RH ajouté : ${newRes.prenom} ${newRes.nom} (${newRes.fonction}).`, 'success');

  res.status(201).json(newRes);
};

export const updateRessource = async (req: Request, res: Response) => {
  const updated = await RessourceModel.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Ressource non trouvée' });
  }

  res.json(updated);
};

export const deleteRessource = async (req: Request, res: Response) => {
  const deleted = await RessourceModel.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Ressource non trouvée' });
  }

  SyncModel.addLog(`Agent RH supprimé : ${deleted.prenom} ${deleted.nom}.`, 'warning');
  res.json({ message: 'Ressource supprimée avec succès', ressource: deleted });
};
