import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SearchFilters } from './components/SearchFilters';
import { ResourceList } from './components/ResourceList';
import { CalendarView } from './components/CalendarView';
import { ResourceProfileModal } from './components/ResourceProfileModal';
import { AssignmentDetailsModal } from './components/AssignmentDetailsModal';
import { ExportReportModal } from './components/ExportReportModal';
import { LoginPage } from './components/LoginPage';
import { AdminPanel } from './components/AdminPanel';
import * as api from './services/api';
import { useAuth } from './context/AuthContext';
import { getNowDateTimeStr } from '../shared/utils/dateHelpers';

import {
  FiltresRecherche,
  DisponibiliteResult,
  RessourceHumaine,
  Affectation,
  StatsGlobales,
} from './types';

export default function App() {
  // --- Authentification (via Context, plus de useState local ici) ---
  const { token, currentUser, login: handleLoginSuccess, logout: handleLogout } = useAuth();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Le service API appelle automatiquement handleLogout si le serveur
  // répond 401 (session invalide/expirée), sans que chaque fonction
  // ci-dessous ait besoin d'y penser.
  useEffect(() => {
    api.setUnauthorizedHandler(handleLogout);
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'recherche' | 'calendrier'>('dashboard');

  const [filtres, setFiltres] = useState<FiltresRecherche>({
    dateDebut: getNowDateTimeStr(9, 0),
    dateFin: getNowDateTimeStr(14, 0),
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
      const resultats = await api.checkDisponibilite(currentFiltres);
      setResultatsDispo(resultats);
    } catch (err) {
      console.error('Erreur API disponibilite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getStats(filtres.dateDebut, filtres.dateFin);
      if (data) setStatsGlobales(data);
    } catch (err) {
      console.error('Erreur API stats:', err);
    }
  };

  const fetchFonctions = async () => {
    try {
      const fonctions = await api.getFonctionsAffichees();
      setFonctionsAffichees(fonctions);
    } catch (err) {
      console.error('Erreur fonctions:', err);
    }
  };

  const handleUpdateFonctionsAffichees = async (newFonctions: string[]) => {
    try {
      setFonctionsAffichees(newFonctions);
      await api.updateFonctionsAffichees(newFonctions);
    } catch (err) {
      console.error('Erreur sauvegarde fonctions:', err);
    }
  };

  const fetchAllData = async () => {
    try {
      const ressourcesData = await api.getRessources();
      setAllRessources(ressourcesData);

      const affectationsData = await api.getAffectations();
      setAllAffectations(affectationsData);

      await fetchFonctions();
    } catch (err) {
      console.error('Erreur chargement donnees globales:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAllData();
    fetchAvailability();
    fetchStats();
  }, [token]);

  // Connexion WebSocket : dès qu'un autre utilisateur modifie une ressource,
  // une affectation ou un utilisateur, on recharge automatiquement les données.
  useEffect(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    socket.onopen = () => {
      console.log('🔌 WebSocket connecté.');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Quel que soit le type d'évènement, on rafraîchit les données affichées.
        fetchAllData();
        fetchAvailability();
        fetchStats();
        console.log('📡 Mise à jour temps réel reçue :', message.type);
      } catch (err) {
        console.error('Erreur message WebSocket:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('Erreur WebSocket:', err);
    };

    return () => {
      socket.close();
    };
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
      dateDebut: getNowDateTimeStr(9, 0),
      dateFin: getNowDateTimeStr(14, 0),
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
      const data = await api.getRessourceById(ressource.id);
      if (data) {
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
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex selection:bg-emerald-500 selection:text-white">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportReportOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
      {/* Barre supérieure visible uniquement sur mobile, avec le bouton menu */}
      <div className="md:hidden sticky top-0 z-20 bg-slate-900 text-white flex items-center gap-3 px-4 py-3 shadow-sm">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 -ml-1.5 text-slate-300 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0 p-1">
          <img src="/logo-snrt-icon.webp" alt="Logo SNRT" className="w-full h-full object-contain" />
        </div>
        <span className="text-sm font-bold">
          RH <span className="text-emerald-400 font-extrabold">Live</span>
        </span>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  Calcul de la disponibilité RH en cours...
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
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Application de consultation de la disponibilité des Ressources Humaines • <strong>RH Live</strong>
          </span>
          <span>
            SNRT / Architecture MERN (Express / React / Node.js)
          </span>
        </div>
      </footer>
      </div>

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
        />
      )}

      {isAdminPanelOpen && (
        <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </div>
  );
}