import { SyncInfo, StatsGlobales } from '../../shared/types';
import { RessourceModel } from './RessourceModel';
import { AffectationModel } from './AffectationModel';

class SyncModelClass {
  private syncState: SyncInfo = {
    derniereSynchro: new Date('2026-08-06T11:30:00Z').toISOString(),
    statut: 'Succès',
    nbRessourcesSync: 0,
    nbAffectationsSync: 0,
    logs: [
      {
        timestamp: new Date('2026-08-06T11:30:00Z').toISOString(),
        message: 'Synchronisation complète mPlanner V2 réussie.',
        type: 'success',
      },
      {
        timestamp: new Date('2026-08-06T10:15:00Z').toISOString(),
        message: 'Mise à jour des grilles de programmes hebdomadaires.',
        type: 'info',
      },
    ],
  };

  public async getSyncState(): Promise<SyncInfo> {
    this.syncState.nbRessourcesSync = await RessourceModel.count();
    this.syncState.nbAffectationsSync = await AffectationModel.count();
    return this.syncState;
  }

  public addLog(message: string, type: 'info' | 'success' | 'warning' | 'error') {
    this.syncState.logs.unshift({
      timestamp: new Date().toISOString(),
      message,
      type,
    });
  }

  public async triggerSync(): Promise<SyncInfo> {
    this.syncState.derniereSynchro = new Date().toISOString();
    this.syncState.statut = 'Succès';
    this.syncState.nbRessourcesSync = await RessourceModel.count();
    this.syncState.nbAffectationsSync = await AffectationModel.count();

    this.addLog('Synchronisation manuelle mPlanner V2 déclenchée avec succès.', 'success');
    return this.syncState;
  }

  public async getStats(): Promise<StatsGlobales> {
    const ressources = await RessourceModel.getAll();
    const affectations = await AffectationModel.getAll();

    const totalRessources = ressources.length;
    const totalAffectations = affectations.length;

    // Conflits count
    const uniqueRessourceIds = new Set(affectations.map((a) => a.ressourceId));
    let conflitsCount = 0;

    uniqueRessourceIds.forEach((resId) => {
      const resAffs = affectations.filter((a) => a.ressourceId === resId);
      for (let i = 0; i < resAffs.length; i++) {
        for (let j = i + 1; j < resAffs.length; j++) {
          const start1 = new Date(resAffs[i].dateDebut);
          const end1 = new Date(resAffs[i].dateFin);
          const start2 = new Date(resAffs[j].dateDebut);
          const end2 = new Date(resAffs[j].dateFin);

          if (start1 < end2 && end1 > start2) {
            conflitsCount++;
          }
        }
      }
    });

    const parFonction: Record<string, number> = {};
    ressources.forEach((r) => {
      parFonction[r.fonction] = (parFonction[r.fonction] || 0) + 1;
    });

    const parChaine: Record<string, number> = {};
    ressources.forEach((r) => {
      parChaine[r.chaineRattachement] = (parChaine[r.chaineRattachement] || 0) + 1;
    });

    const occupiedRessourceCount = uniqueRessourceIds.size;
    const tauxOccupation = totalRessources > 0 ? Math.round((occupiedRessourceCount / totalRessources) * 100) : 0;

    return {
      totalRessources,
      totalAffectations,
      tauxOccupation,
      conflitsDetectes: conflitsCount,
      parFonction,
      parChaine,
    };
  }
}

export const SyncModel = new SyncModelClass();
