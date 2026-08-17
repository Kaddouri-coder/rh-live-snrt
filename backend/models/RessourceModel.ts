import { RessourceHumaine } from '../../shared/types';
import { pool } from '../db';

// Convertit une ligne SQL (snake_case) vers l'objet frontend (camelCase)
function mapRowToRessource(row: any): RessourceHumaine {
  return {
    id: row.id,
    matricule: row.matricule,
    nom: row.nom,
    prenom: row.prenom,
    fonction: row.fonction,
    direction: row.direction,
    chaineRattachement: row.chaine_rattachement,
    email: row.email,
    telephone: row.telephone,
    statutContrat: row.statut_contrat,
    competences: row.competences || [],
  };
}

class RessourceModelClass {
  public async getAll(): Promise<RessourceHumaine[]> {
    const result = await pool.query('SELECT * FROM ressources_humaines ORDER BY nom, prenom');
    return result.rows.map(mapRowToRessource);
  }

  public async getById(id: string): Promise<RessourceHumaine | undefined> {
    const result = await pool.query('SELECT * FROM ressources_humaines WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    return mapRowToRessource(result.rows[0]);
  }

  // Génère un ID séquentiel du type "res-004" (au lieu d'un timestamp).
  private async generateNextId(): Promise<string> {
    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM ressources_humaines');
    let n = countResult.rows[0].count + 1;
    let candidate = `res-${String(n).padStart(3, '0')}`;

    while (true) {
      const exists = await pool.query('SELECT 1 FROM ressources_humaines WHERE id = $1', [candidate]);
      if (exists.rows.length === 0) break;
      n += 1;
      candidate = `res-${String(n).padStart(3, '0')}`;
    }

    return candidate;
  }

  public async create(data: Partial<RessourceHumaine>): Promise<RessourceHumaine> {
    const id = await this.generateNextId();
    const matricule = data.matricule || `M${Math.floor(10000 + Math.random() * 90000)}`;
    const nom = data.nom || 'Sans nom';
    const prenom = data.prenom || 'Sans prénom';
    const fonction = data.fonction || 'Opérateur';
    const direction = data.direction || 'Direction de la Production';
    const chaineRattachement = data.chaineRattachement || 'Al Aoula';
    const email = data.email || `${prenom.toLowerCase()}.${nom.toLowerCase()}@snrt.ma`;
    const telephone = data.telephone || '+212 661 000000';
    const statutContrat = data.statutContrat || 'Permanent';
    const competences = data.competences || ['Équipement Broadcast', 'mPlanner V2'];

    const result = await pool.query(
      `INSERT INTO ressources_humaines
        (id, matricule, nom, prenom, fonction, direction, chaine_rattachement, statut_contrat, email, telephone, competences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [id, matricule, nom, prenom, fonction, direction, chaineRattachement, statutContrat, email, telephone, competences]
    );

    return mapRowToRessource(result.rows[0]);
  }

  public async update(id: string, updates: Partial<RessourceHumaine>): Promise<RessourceHumaine | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, id };

    const result = await pool.query(
      `UPDATE ressources_humaines
       SET matricule = $1, nom = $2, prenom = $3, fonction = $4, direction = $5,
           chaine_rattachement = $6, statut_contrat = $7, email = $8, telephone = $9, competences = $10
       WHERE id = $11
       RETURNING *`,
      [
        merged.matricule,
        merged.nom,
        merged.prenom,
        merged.fonction,
        merged.direction,
        merged.chaineRattachement,
        merged.statutContrat,
        merged.email,
        merged.telephone,
        merged.competences,
        id,
      ]
    );

    if (result.rows.length === 0) return null;
    return mapRowToRessource(result.rows[0]);
  }

  public async delete(id: string): Promise<RessourceHumaine | null> {
    const result = await pool.query('DELETE FROM ressources_humaines WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return null;
    return mapRowToRessource(result.rows[0]);
  }

  public async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM ressources_humaines');
    return result.rows[0].count;
  }
}

export const RessourceModel = new RessourceModelClass();
