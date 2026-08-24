// Ce fichier centralise TOUS les appels réseau (fetch) vers le backend.
// C'est le "serveur avec son carnet" de l'analogie du restaurant : il porte
// les commandes vers la cuisine (l'API) et rapporte les plats (les données)
// aux composants qui les ont demandés.
//
// Aucun composant ne devrait appeler fetch(...) directement pour parler à
// notre propre API — ils passent tous par les fonctions de ce fichier.

import {
  FiltresRecherche,
  DisponibiliteResult,
  RessourceHumaine,
  Affectation,
  StatsGlobales,
  AppUser,
} from '../types';

const TOKEN_KEY = 'mplanner_token';

// --- Gestion du token & déconnexion automatique ---

// App.tsx enregistre ici sa fonction de déconnexion. Si le serveur répond 401
// (session invalide/expirée), ce service déclenche automatiquement la
// déconnexion, sans que chaque fonction ait besoin d'y penser.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Wrapper interne : ajoute automatiquement le token à chaque requête,
// et gère la déconnexion automatique en cas de 401.
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${getToken()}`,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }
  return res;
}

// --- Authentification ---

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; token?: string; user?: AppUser; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.error };
  }
  return { ok: true, token: data.token, user: data.user };
}

// --- Disponibilité / Recherche ---

export async function checkDisponibilite(filtres: FiltresRecherche): Promise<DisponibiliteResult[]> {
  const res = await apiFetch('/api/disponibilite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filtres),
  });
  if (!res.ok) {
    throw new Error('Erreur lors du calcul de disponibilité');
  }
  const data = await res.json();
  return data.resultats || [];
}

// --- Statistiques (Tableau de bord) ---

export async function getStats(dateDebut: string, dateFin: string): Promise<StatsGlobales | null> {
  const query = `?debut=${encodeURIComponent(dateDebut)}&fin=${encodeURIComponent(dateFin)}`;
  const res = await apiFetch(`/api/stats${query}`);
  if (!res.ok) return null;
  return res.json();
}

// --- Fonctions affichées (filtre calendrier) ---

export async function getFonctionsAffichees(): Promise<string[]> {
  const res = await apiFetch('/api/fonctions');
  if (!res.ok) return [];
  const data = await res.json();
  return data.fonctionsAffichees || [];
}

export async function updateFonctionsAffichees(fonctions: string[]): Promise<void> {
  await apiFetch('/api/fonctions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fonctions }),
  });
}

// --- Ressources humaines ---

export async function getRessources(): Promise<RessourceHumaine[]> {
  const res = await apiFetch('/api/ressources');
  if (!res.ok) return [];
  return res.json();
}

export async function getRessourceById(
  id: string
): Promise<{ ressource: RessourceHumaine; affectations: Affectation[] } | null> {
  const res = await apiFetch(`/api/ressources/${id}`);
  if (!res.ok) return null;
  return res.json();
}

// --- Affectations ---

export async function getAffectations(): Promise<Affectation[]> {
  const res = await apiFetch('/api/affectations');
  if (!res.ok) return [];
  return res.json();
}