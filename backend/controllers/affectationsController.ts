import { Request, Response } from 'express';
import { AffectationModel } from '../models/AffectationModel';
import { SyncModel } from '../models/SyncModel';

export const getAffectations = async (req: Request, res: Response) => {
  const affectations = await AffectationModel.getAll();
  res.json(affectations);
};

export const createAffectation = async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.ressourceId || !data.emissionNom || !data.dateDebut || !data.dateFin) {
    return res.status(400).json({ error: 'Champs requis manquants pour la création d\'affectation' });
  }

  const conflict = await AffectationModel.checkConflict(data.ressourceId, data.dateDebut, data.dateFin);
  if (conflict) {
    return res.status(409).json({
      error: 'CONFLICT',
      message: `Cette ressource est déjà affectée à "${conflict.emissionNom}" du ${new Date(conflict.dateDebut).toLocaleString('fr-FR')} au ${new Date(conflict.dateFin).toLocaleString('fr-FR')}. Impossible de créer une affectation sur une période qui se chevauche.`,
      conflict,
    });
  }

  const newAff = await AffectationModel.create(data);
  SyncModel.addLog(`Nouvelle affectation créée : ${newAff.emissionNom} (${newAff.lieu}).`, 'info');

  res.status(201).json(newAff);
};
