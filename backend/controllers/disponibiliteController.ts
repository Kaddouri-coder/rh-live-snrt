import { Request, Response } from 'express';
import { AffectationModel } from '../models/AffectationModel';

export const checkDisponibilite = async (req: Request, res: Response) => {
  const filtres = req.body;
  const resultats = await AffectationModel.checkDisponibilite(filtres);
  res.json(resultats);
};
