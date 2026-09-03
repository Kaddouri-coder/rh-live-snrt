import { Request, Response } from 'express';
import { SyncModel } from '../models/SyncModel';

export const getStats = async (req: Request, res: Response) => {
  const { debut, fin } = req.query;
  const stats = await SyncModel.getStats(
    typeof debut === 'string' ? debut : undefined,
    typeof fin === 'string' ? fin : undefined
  );
  res.json(stats);
};