import { Request, Response } from 'express';
import { AffectationModel } from '../models/AffectationModel';

export const getAffectations = async (req: Request, res: Response) => {
  const affectations = await AffectationModel.getAll();
  res.json(affectations);
};