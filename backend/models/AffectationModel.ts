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

  // Génère un ID séquentiel du type "aff-004" (au lieu d'un timestamp).
  // Vérifie l'unicité en base au cas où il y aurait des "trous" dans la numérotation.
  private async generateNextId(): Promise<string> {
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM affectations');
    let n = countResult.rows[0].count + 1;
    let candidate = `aff-${String(n).padStart(3, '0')}`;

    while (true) {
      const exists = await pool.query('SELECT 1 FROM affectations WHERE id = $1', [candidate]);
      if (exists.rows.length === 0) break;
      n += 1;
      candidate = `aff-${String(n).padStart(3, '0')}`;
    }

    return candidate;
  }

  public async create(data: Partial<Affectation>): Promise<Affectation> {
    const id = await this.generateNextId();
    const ressourceId = data.ressourceId || '';
    const emissionNom = data.emissionNom || 'Nouvelle Émission';
    const codeEmission = data.codeEmission || `EM-${Math.floor(100 + Math.random() * 900)}`;
    const lieu = data.lieu || 'Studio 1 - Rabat';
    const chaine = data.chaine || 'Al Aoula';
    const dateDebut = data.dateDebut || new Date().toISOString();
    const dateFin = data.dateFin || new Date(Date.now() + 7200000).toISOString();
    const typeProduction = data.typeProduction || 'Plateau';
    const statut = data.statut || 'Confirmé';

    const result = await pool.query(
      `INSERT INTO affectations
        (id, ressource_id, emission_nom, code_emission, lieu, chaine, date_debut, date_fin, type_production, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, ressourceId, emissionNom, codeEmission, lieu, chaine, dateDebut, dateFin, typeProduction, statut]
    );

    return mapRowToAffectation(result.rows[0]);
  }

  public async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM affectations');
    return result.rows[0].count;
  }

  // Vérifie si une ressource a déjà une affectation qui chevauche la période donnée.
  // Retourne l'affectation en conflit (la première trouvée), ou null si aucune.
  public async checkConflict(
    ressourceId: string,
    dateDebut: string,
    dateFin: string,
    excludeAffectationId?: string
  ): Promise<Affectation | null> {
    const result = await pool.query(
      `SELECT * FROM affectations
       WHERE ressource_id = $1
         AND date_debut < $3
         AND date_fin > $2
         AND ($4::text IS NULL OR id <> $4)
       LIMIT 1`,
      [ressourceId, dateDebut, dateFin, excludeAffectationId || null]
    );
    return result.rows.length > 0 ? mapRowToAffectation(result.rows[0]) : null;
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
