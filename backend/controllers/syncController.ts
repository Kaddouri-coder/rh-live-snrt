import { Request, Response } from 'express';
import { SyncModel } from '../models/SyncModel';

export const getStats = async (req: Request, res: Response) => {
  const stats = await SyncModel.getStats();
  res.json(stats);
};