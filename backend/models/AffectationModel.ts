import { Affectation, FiltresRecherche, DisponibiliteResult } from '../../shared/types';
import { pool } from '../db';
import { RessourceModel } from './RessourceModel';

function mapRowToAffectation(row: any): Affectation {
  return {
    id: row.id,
    ressourceId: row.ressource_id,
    emissionNom: row.emission_nom,
    codeEmission: row.code_emission,
    lieu: row.lieu,
    chaine: row.chaine,
    dateDebut: new Date(row.date_debut).toISOString(),
    dateFin: new Date(row.date_fin).toISOString(),
    typeProduction: row.type_production,
    statut: row.statut,
  };
}

class AffectationModelClass {
  public async getAll(): Promise<Affectation[]> {
    const result = await pool.query('SELECT * FROM affectations ORDER BY date_debut');
    return result.rows.map(mapRowToAffectation);
  }

  public async getByResourceId(ressourceId: string): Promise<Affectation[]> {
    const result = await pool.query(
      'SELECT * FROM affectations WHERE ressource_id = $1 ORDER BY date_debut',
      [ressourceId]
    );
    return result.rows.map(mapRowToAffectation);
  }

  public async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM affectations');
    return result.rows[0].count;
  }

  public async checkDisponibilite(filtres: FiltresRecherche): Promise<DisponibiliteResult[]> {
    const startReq = new Date(filtres.dateDebut);
    const endReq = new Date(filtres.dateFin);

    const ressources = await RessourceModel.getAll();

    const filtered = ressources.filter((res) => {
      if (filtres.fonction && filtres.fonction !== 'Toutes les fonctions' && res.fonction !== filtres.fonction) return false;
      if (filtres.chaine && filtres.chaine !== 'Toutes les chaînes' && res.chaineRattachement !== filtres.chaine) return false;
      if (filtres.direction && filtres.direction !== 'Toutes les directions' && res.direction !== filtres.direction) return false;
      if (filtres.statutContrat && filtres.statutContrat !== 'Tous les statuts' && res.statutContrat !== filtres.statutContrat) return false;

      const q = (filtres.nomRecherche || filtres.query || '').toLowerCase();
      if (q) {
        const matchNom = `${res.prenom} ${res.nom}`.toLowerCase().includes(q);
        const matchMatricule = res.matricule.toLowerCase().includes(q);
        if (!matchNom && !matchMatricule) return false;
      }
      return true;
    });

    const resultats: DisponibiliteResult[] = await Promise.all(
      filtered.map(async (res) => {
        const resAffectations = await this.getByResourceId(res.id);

        const conflits = resAffectations.filter((aff) => {
          if (filtres.typeProduction && filtres.typeProduction !== 'Tous les types' && aff.typeProduction !== filtres.typeProduction) {
            return false;
          }
          const affStart = new Date(aff.dateDebut);
          const affEnd = new Date(aff.dateFin);
          return startReq < affEnd && endReq > affStart;
        });

        const estDispo = conflits.length === 0;

        return {
          ressource: res,
          etat: estDispo ? 'Disponible' : 'Occupée',
          affectationsConflit: conflits,
          estDisponible: estDispo,
          conflitEventuel: conflits[0],
          affectationsSurPeriode: resAffectations,
        } as DisponibiliteResult;
      })
    );

    if (filtres.etat && filtres.etat !== 'Tous') {
      return resultats.filter((r) => r.etat === filtres.etat);
    }

    return resultats;
  }
}

export const AffectationModel = new AffectationModelClass();