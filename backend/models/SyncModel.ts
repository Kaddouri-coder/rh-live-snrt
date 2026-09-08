import { StatsGlobales } from '../../shared/types';
import { RessourceModel } from './RessourceModel';
import { AffectationModel } from './AffectationModel';
import { hasTimeOverlap } from '@/shared/utils/dateOverlap';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

class SyncModelClass {
  // Journal interne d'évènements (audit léger). Non affiché dans l'UI actuellement,
  // conservé pour une éventuelle page d'historique future.
  private logs: LogEntry[] = [];

  public addLog(message: string, type: 'info' | 'success' | 'warning' | 'error') {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      message,
      type,
    });
  }

  public async getStats(dateDebut?: string, dateFin?: string): Promise<StatsGlobales> {
    const ressources = await RessourceModel.getAll();
    const allAffectations = await AffectationModel.getAll();

    // Si une période valide est fournie, on ne garde que les affectations qui
    // la chevauchent (mêmes règles que la recherche de disponibilité) au lieu
    // de calculer sur tout l'historique.
    const periodStart = dateDebut ? new Date(dateDebut) : null;
    const periodEnd = dateFin ? new Date(dateFin) : null;
    const hasValidPeriod = !!(
      periodStart &&
      periodEnd &&
      !isNaN(periodStart.getTime()) &&
      !isNaN(periodEnd.getTime())
    );

    const affectations = hasValidPeriod
      ? allAffectations.filter((a) =>
          hasTimeOverlap(periodStart as Date, periodEnd as Date, new Date(a.dateDebut), new Date(a.dateFin))
        )
      : allAffectations;

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

          if (hasTimeOverlap(start1, end1, start2, end2)) {
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

    // Disponibilité réelle par chaîne : pour chaque chaîne, part des ressources
    // qui n'ont AUCUNE affectation chevauchant la période (mêmes règles que
    // tauxOccupation ci-dessous, mais détaillées chaîne par chaîne).
    const disponibiliteParChaine: Record<string, number> = {};
    Object.keys(parChaine).forEach((chaine) => {
      const resIdsInChaine = new Set(
        ressources.filter((r) => r.chaineRattachement === chaine).map((r) => r.id)
      );
      const totalInChaine = resIdsInChaine.size;
      if (totalInChaine === 0) {
        disponibiliteParChaine[chaine] = 0;
        return;
      }
      const occupiedInChaine = new Set(
        affectations.filter((a) => resIdsInChaine.has(a.ressourceId)).map((a) => a.ressourceId)
      ).size;
      disponibiliteParChaine[chaine] = Math.round(((totalInChaine - occupiedInChaine) / totalInChaine) * 100);
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
      disponibiliteParChaine,
    };
  }
}

export const SyncModel = new SyncModelClass();