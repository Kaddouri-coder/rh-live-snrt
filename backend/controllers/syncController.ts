import { Request, Response } from 'express';
import { SyncModel } from '../models/SyncModel';

export const getSyncStatus = async (req: Request, res: Response) => {
  const state = await SyncModel.getSyncState();
  res.json(state);
};

export const triggerSync = async (req: Request, res: Response) => {
  const result = await SyncModel.triggerSync();
  res.json(result);
};

export const getStats = async (req: Request, res: Response) => {
  const stats = await SyncModel.getStats();
  res.json(stats);
};
