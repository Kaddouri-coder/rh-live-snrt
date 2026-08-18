import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SearchFilters } from './components/SearchFilters';
import { ResourceList } from './components/ResourceList';
import { CalendarView } from './components/CalendarView';
import { ResourceProfileModal } from './components/ResourceProfileModal';
import { AssignmentDetailsModal } from './components/AssignmentDetailsModal';
import { MPlannerSyncModal } from './components/MPlannerSyncModal';
import { ExportReportModal } from './components/ExportReportModal';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';

import {
  FiltresRecherche,
  DisponibiliteResult,
  RessourceHumaine,
  Affectation,
  SyncInfo,
  StatsGlobales,
  AppUser,
} from './types';

const TOKEN_KEY = 'mplanner_token';
const USER_KEY = 'mplanner_user';

export default function App() {
  // --- Authentification ---
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const handleLoginSuccess = (newToken: string, user: AppUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  // Wrapper fetch qui ajoute automatiquement le token d'authentification,
  // et déconnecte automatiquement si la session est invalide/expirée (401).
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
    }
    return res;
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'recherche' | 'calendrier' | 'sync'>('dashboard');

  const [filtres, setFiltres] = useState<FiltresRecherche>({
    dateDebut: '2026-08-10T09:00',
    dateFin: '2026-08-10T14:00',
    chaine: 'Toutes les chaînes',
    direction: 'Toutes les directions',
    fonction: 'Toutes les fonctions',
    nomRecherche: '',
    etat: 'Tous',
  });

  const [resultatsDispo, setResultatsDispo] = useState<DisponibiliteResult[]>([]);
  const [statsGlobales, setStatsGlobales] = useState<StatsGlobales | null>(null);
  const [allRessources, setAllRessources] = useState<RessourceHumaine[]>([]);
  const [allAffectations, setAllAffectations] = useState<Affectation[]>([]);
  const [fonctionsAffichees, setFonctionsAffichees] = useState<string[]>([]);

  const [syncInfo, setSyncInfo] = useState<SyncInfo>({
    derniereSynchro: new Date('2026-08-06T11:30:00Z').toISOString(),
    statut: 'Succès',
    nbRessourcesSync: 16,
    nbAffectationsSync: 10,
    logs: [],
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedProfile, setSelectedProfile] = useState<{
    ressource: RessourceHumaine;
    affectations: Affectation[];
  } | null>(null);

  const [selectedAffectation, setSelectedAffectation] = useState<{
    affectation: Affectation;
    ressource: RessourceHumaine | null;
  } | null>(null);

  const [isExportReportOpen, setIsExportReportOpen] = useState<boolean>(false);

  const fetchAvailability = async (currentFiltres = filtres) => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/disponibilite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFiltres),
      });

      if (!res.ok) {
        throw new Error('Erreur lors du calcul de disponibilité');
      }

      const data = await res.json();
      setResultatsDispo(data.resultats || []);
    } catch (err) {
      console.error('Erreur API disponibilite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const query = `?debut=${encodeURIComponent(filtres.dateDebut)}&fin=${encodeURIComponent(filtres.dateFin)}`;
      const res = await apiFetch(`/api/stats${query}`);
      if (res.ok) {
        const data = await res.json();
        setStatsGlobales(data);
      }
    } catch (err) {
      console.error('Erreur API stats:', err);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await apiFetch('/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        setSyncInfo(data);
      }
    } catch (err) {
      console.error('Erreur sync status:', err);
    }
  };

  const fetchFonctions = async () => {
    try {
      const res = await apiFetch('/api/fonctions');
      if (res.ok) {
        const data = await res.json();
        setFonctionsAffichees(data.fonctionsAffichees || []);
      }
    } catch (err) {
      console.error('Erreur fonctions:', err);
    }
  };

  const handleUpdateFonctionsAffichees = async (newFonctions: string[]) => {
    try {
      setFonctionsAffichees(newFonctions);
      await apiFetch('/api/fonctions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fonctions: newFonctions }),
      });
      await fetchSyncStatus();
    } catch (err) {
      console.error('Erreur sauvegarde fonctions:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const resRes = await apiFetch('/api/ressources');
      if (resRes.ok) {
        const ressourcesData = await resRes.json();
        setAllRessources(ressourcesData);
      }
      const resAff = await apiFetch('/api/affectations');
      if (resAff.ok) {
        const affectationsData = await resAff.json();
        setAllAffectations(affectationsData);
      }
      await fetchFonctions();
    } catch (err) {
      console.error('Erreur chargement donnees globales:', err);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiFetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        const newSyncData = await res.json();
        setSyncInfo(newSyncData);
        await fetchAvailability();
        await fetchStats();
        await fetchAllData();
      }
    } catch (err) {
      console.error('Erreur trigger sync:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchSyncStatus();
    fetchAllData();
    fetchAvailability();
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchStats();
  }, [filtres.dateDebut, filtres.dateFin]);

  const handleApplyPreset = (preset: {
    fonction?: string;
    chaine?: string;
    dateDebut?: string;
    dateFin?: string;
    etat?: 'Tous' | 'Disponible' | 'Occupée';
  }) => {
    const newFiltres: FiltresRecherche = {
      ...filtres,
      fonction: preset.fonction || filtres.fonction,
      chaine: preset.chaine || filtres.chaine,
      dateDebut: preset.dateDebut ? preset.dateDebut : filtres.dateDebut,
      dateFin: preset.dateFin ? preset.dateFin : filtres.dateFin,
      etat: preset.etat || filtres.etat,
    };
    setFiltres(newFiltres);
    setActiveTab('recherche');
    fetchAvailability(newFiltres);
  };

  const handleResetFilters = () => {
    const defaultFiltres: FiltresRecherche = {
      dateDebut: '2026-08-10T09:00',
      dateFin: '2026-08-10T14:00',
      chaine: 'Toutes les chaînes',
      direction: 'Toutes les directions',
      fonction: 'Toutes les fonctions',
      nomRecherche: '',
      etat: 'Tous',
    };
    setFiltres(defaultFiltres);
    fetchAvailability(defaultFiltres);
  };

  const handleOpenResourceProfile = async (ressource: RessourceHumaine) => {
    try {
      const res = await apiFetch(`/api/ressources/${ressource.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProfile({
          ressource: data.ressource,
          affectations: data.affectations,
        });
      }
    } catch (err) {
      console.error('Erreur fiche ressource:', err);
    }
  };

  const formatDateDisplay = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nbDisponibles = resultatsDispo.filter((r) => r.etat === 'Disponible').length;
  const nbOccupees = resultatsDispo.filter((r) => r.etat === 'Occupée').length;

  // --- Page de connexion (si non authentifié) ---
  if (!token || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Header
        syncInfo={syncInfo}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportReportOpen(true)}
        currentUser={currentUser}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={statsGlobales}
            filtres={filtres}
            onNavigateToRecherche={(preset) => {
              if (preset) {
                handleApplyPreset(preset);
              } else {
                setActiveTab('recherche');
              }
            }}
            dateDebutFormatted={formatDateDisplay(filtres.dateDebut)}
            dateFinFormatted={formatDateDisplay(filtres.dateFin)}
          />
        )}

        {activeTab === 'recherche' && (
          <div>
            <SearchFilters
              filtres={filtres}
              onChangeFiltres={(newF) => setFiltres(newF)}
              onSearch={() => fetchAvailability()}
              onReset={handleResetFilters}
              onApplyPreset={handleApplyPreset}
              totalResultats={resultatsDispo.length}
              nbDisponibles={nbDisponibles}
              nbOccupees={nbOccupees}
            />

            {isLoading ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                <p className="text-xs text-slate-500 font-medium">
                  Calcul de la disponibilité RH mPlanner V2 en cours...
                </p>
              </div>
            ) : (
              <ResourceList
                resultats={resultatsDispo}
                onSelectResource={handleOpenResourceProfile}
                onSelectAffectation={(aff) => {
                  const res = allRessources.find((r) => r.id === aff.ressourceId) || null;
                  setSelectedAffectation({ affectation: aff, ressource: res });
                }}
                dateHeureDebut={filtres.dateDebut}
                dateHeureFin={filtres.dateFin}
              />
            )}
          </div>
        )}

        {activeTab === 'calendrier' && (
          <CalendarView
            ressources={allRessources}
            affectations={allAffectations.length > 0 ? allAffectations : resultatsDispo.flatMap((r) => r.affectationsConflit)}
            onSelectResource={handleOpenResourceProfile}
            onSelectAffectation={(aff) => {
              const res = allRessources.find((r) => r.id === aff.ressourceId) || null;
              setSelectedAffectation({ affectation: aff, ressource: res });
            }}
            fonctionsAffichees={fonctionsAffichees}
            onUpdateFonctionsAffichees={handleUpdateFonctionsAffichees}
          />
        )}

        {activeTab === 'sync' && (
          <MPlannerSyncModal
            syncInfo={syncInfo}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1800px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Application de consultation de la disponibilité des Ressources Humaines • <strong>mPlanner V2</strong>
          </span>
          <span>
            SNRT / Architecture MERN (Express / React / Node.js)
          </span>
        </div>
      </footer>

      {selectedProfile && (
        <ResourceProfileModal
          ressource={selectedProfile.ressource}
          affectations={selectedProfile.affectations}
          onClose={() => setSelectedProfile(null)}
          onSelectAffectation={(aff) => {
            setSelectedAffectation({ affectation: aff, ressource: selectedProfile.ressource });
          }}
        />
      )}

      {selectedAffectation && (
        <AssignmentDetailsModal
          affectation={selectedAffectation.affectation}
          ressource={selectedAffectation.ressource}
          onClose={() => setSelectedAffectation(null)}
        />
      )}

      {isExportReportOpen && (
        <ExportReportModal
          resultats={resultatsDispo}
          filtres={filtres}
          onClose={() => setIsExportReportOpen(false)}
          derniereSynchro={syncInfo.derniereSynchro}
        />
      )}

      {isAdminPanelOpen && (
        <AdminPanel token={token} currentUser={currentUser} onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </div>
  );
}