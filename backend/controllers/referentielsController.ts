import { Request, Response } from 'express';
import { CHAINES_LIST, DIRECTIONS_LIST, FONCTIONS_LIST } from '../../frontend/data/constants';

export const getReferentiels = (req: Request, res: Response) => {
  res.json({
    chaines: CHAINES_LIST,
    directions: DIRECTIONS_LIST,
    fonctions: FONCTIONS_LIST,
  });
};
