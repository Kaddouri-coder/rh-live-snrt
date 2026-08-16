import { Request, Response } from 'express';
import { FonctionModel } from '../models/FonctionModel';
import { SyncModel } from '../models/SyncModel';

export const getFonctionsConfig = async (req: Request, res: Response) => {
  res.json({
    toutesFonctions: await FonctionModel.getAllAvailable(),
    fonctionsAffichees: await FonctionModel.getFonctionsAffichees(),
  });
};

export const updateFonctionsConfig = (req: Request, res: Response) => {
  const { fonctions } = req.body;
  if (!Array.isArray(fonctions)) {
    return res.status(400).json({ error: 'Un tableau "fonctions" est requis' });
  }

  const updated = FonctionModel.setFonctionsAffichees(fonctions);
  SyncModel.addLog(`Paramétrage des fonctions affichées mis à jour (${updated.length} sélectionnées).`, 'info');

  res.json({ success: true, fonctionsAffichees: updated });
};