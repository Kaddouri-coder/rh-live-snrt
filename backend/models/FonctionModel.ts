import { pool } from '../db';

class FonctionModelClass {
  // Fonctions actuellement sélectionnées pour être affichées dans le calendrier.
  // null = pas encore initialisé (on affichera tout par défaut au premier chargement).
  private fonctionsAffichees: string[] | null = null;

  // Récupère la liste des fonctions réellement présentes dans la base (DISTINCT),
  // au lieu d'une liste statique qui pouvait ne pas correspondre aux données réelles.
  public async getAllAvailable(): Promise<string[]> {
    const result = await pool.query(
      `SELECT DISTINCT fonction FROM ressources_humaines
       WHERE fonction IS NOT NULL AND fonction <> ''
       ORDER BY fonction`
    );
    return result.rows.map((r) => r.fonction);
  }

  public async getFonctionsAffichees(): Promise<string[]> {
    if (this.fonctionsAffichees === null) {
      // Par défaut : toutes les fonctions présentes en base sont affichées
      this.fonctionsAffichees = await this.getAllAvailable();
    }
    return this.fonctionsAffichees;
  }

  public setFonctionsAffichees(fonctions: string[]): string[] {
    this.fonctionsAffichees = fonctions;
    return this.fonctionsAffichees;
  }

  // Si un nouvel agent est créé avec une fonction pas encore visible dans les
  // filtres/calendrier, on l'ajoute automatiquement à la liste affichée.
  public async ensureFonctionVisible(fonction: string): Promise<void> {
    if (!fonction) return;
    if (this.fonctionsAffichees === null) {
      this.fonctionsAffichees = await this.getAllAvailable();
      return;
    }
    if (!this.fonctionsAffichees.includes(fonction)) {
      this.fonctionsAffichees.push(fonction);
    }
  }
}

export const FonctionModel = new FonctionModelClass();