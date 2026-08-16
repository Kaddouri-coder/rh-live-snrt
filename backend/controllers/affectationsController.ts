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

  const newAff = await AffectationModel.create(data);
  SyncModel.addLog(`Nouvelle affectation créée : ${newAff.emissionNom} (${newAff.lieu}).`, 'info');

  res.status(201).json(newAff);
};
