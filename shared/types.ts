export interface RessourceHumaine {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string; // ex: Cameraman, Ingénieur du son, Scripte, Realisateur
  direction: string; // ex: Direction de la Production, Direction de l'Information
  chaineRattachement: string; // ex: Al Aoula, 2M, Arryadia, Assadissa
  statutContrat: 'Permanent' | 'CDI' | 'Pigiste' | 'Intermittent';
  email: string;
  telephone: string;
  competences: string[];
}

export interface Affectation {
  id: string;
  ressourceId: string;
  emissionNom: string;
  codeEmission: string;
  lieu: string;
  chaine: string;
  dateDebut: string; // ISO String
  dateFin: string; // ISO String
  typeProduction: 'Direct' | 'Enregistrement' | 'Reportage' | 'Plateau';
  statut: 'Confirmé' | 'Option' | 'Brouillon';
}

export interface FiltresRecherche {
  dateDebut: string;
  dateFin: string;
  fonction: string;
  chaine: string;
  direction: string;
  typeProduction?: string;
  statutContrat?: string;
  query?: string;
  nomRecherche?: string;
  etat?: 'Tous' | 'Disponible' | 'Occupée';
}

export interface DisponibiliteResult {
  ressource: RessourceHumaine;
  etat: 'Disponible' | 'Occupée';
  affectationsConflit: Affectation[];
  estDisponible?: boolean;
  conflitEventuel?: Affectation;
  affectationsSurPeriode?: Affectation[];
}

export interface SyncInfo {
  derniereSynchro: string;
  statut: 'Succès' | 'En cours' | 'Erreur';
  nbRessourcesSync: number;
  nbAffectationsSync: number;
  logs: Array<{
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export interface StatsGlobales {
  totalRessources: number;
  totalAffectations: number;
  tauxOccupation: number;
  conflitsDetectes: number;
  parFonction: Record<string, number>;
  parChaine: Record<string, number>;
}
