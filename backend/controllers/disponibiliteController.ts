import { Request, Response } from 'express';
import { AffectationModel } from '../models/AffectationModel';

export const checkDisponibilite = async (req: Request, res: Response) => {
  const filtres = req.body;

  const debut = new Date(filtres?.dateDebut);
  const fin = new Date(filtres?.dateFin);

  if (!filtres?.dateDebut || !filtres?.dateFin || isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    return res.status(400).json({ error: 'dateDebut et dateFin sont requises et doivent être des dates valides.' });
  }

  if (debut >= fin) {
    return res.status(400).json({ error: 'dateDebut doit être antérieure à dateFin.' });
  }

  const resultats = await AffectationModel.checkDisponibilite(filtres);
  res.json({ resultats });
};