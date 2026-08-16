import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SearchFilters } from './components/SearchFilters';
import { ResourceList } from './components/ResourceList';
import { CalendarView } from './components/CalendarView';
import { ResourceProfileModal } from './components/ResourceProfileModal';
import { AssignmentDetailsModal } from './components/AssignmentDetailsModal';
import { AddAssignmentModal } from './components/AddAssignmentModal';
import { AddResourceModal } from './components/AddResourceModal';
import { MPlannerSyncModal } from './components/MPlannerSyncModal';
import { ExportReportModal } from './components/ExportReportModal';

import {
  FiltresRecherche,
  DisponibiliteResult,
  RessourceHumaine,
  Affectation,
  SyncInfo,
  StatsGlobales,
} from './types';

export default function App() {
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

  const [addAssignmentTargetResource, setAddAssignmentTargetResource] = useState<RessourceHumaine | null>(null);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState<boolean>(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState<boolean>(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState<boolean>(false);

  const fetchAvailability = async (currentFiltres = filtres) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/disponibilite', {
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
      const res = await fetch(`/api/stats${query}`);
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
      const res = await fetch('/api/sync/status');
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
      const res = await fetch('/api/fonctions');
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
      await fetch('/api/fonctions', {
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
      const resRes = await fetch('/api/ressources');
      if (resRes.ok) {
        const ressourcesData = await resRes.json();
        setAllRessources(ressourcesData);
      }
      const resAff = await fetch('/api/affectations');
      if (resAff.ok) {
        const affectationsData = await resAff.json();
        setAllAffectations(affectationsData);
      }
      await fetchFonctions();
    } catch (err) {
      console.error('Erreur chargement donnees globales:', err);
    }
  };

  const handleSaveResource = async (resourceData: Partial<RessourceHumaine>) => {
    try {
      const res = await fetch('/api/ressources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });
      if (res.ok) {
        await fetchAllData();
        await fetchAvailability();
        await fetchStats();
        await fetchSyncStatus();
      }
    } catch (err) {
      console.error('Erreur creation ressource:', err);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
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
    fetchSyncStatus();
    fetchAllData();
    fetchAvailability();
    fetchStats();
  }, []);

  useEffect(() => {
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
      const res = await fetch(`/api/ressources/${ressource.id}`);
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

  const handleSaveAssignment = async (newAffData: Partial<Affectation>) => {
    try {
      const res = await fetch('/api/affectations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAffData),
      });

      if (res.ok) {
        setIsAddAssignmentOpen(false);
        setAddAssignmentTargetResource(null);
        await fetchAvailability();
        await fetchStats();
        await fetchSyncStatus();
      }
    } catch (err) {
      console.error('Erreur sauvegarde affectation:', err);
    }
  };

  const handleDeleteAssignment = async (affectationId: string) => {
    try {
      const res = await fetch(`/api/affectations/${affectationId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedAffectation(null);
        await fetchAvailability();
        await fetchStats();
        await fetchSyncStatus();
      }
    } catch (err) {
      console.error('Erreur suppression affectation:', err);
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Header
        syncInfo={syncInfo}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportReportOpen(true)}
        onOpenAddResourceModal={() => setIsAddResourceOpen(true)}
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
            onOpenAddAssignment={() => {
              setAddAssignmentTargetResource(null);
              setIsAddAssignmentOpen(true);
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
                onOpenAddAssignment={(res) => {
                  setAddAssignmentTargetResource(res);
                  setIsAddAssignmentOpen(true);
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
          onDeleteAffectation={handleDeleteAssignment}
        />
      )}

      {isAddAssignmentOpen && (
        <AddAssignmentModal
          ressources={allRessources}
          preselectedResource={addAssignmentTargetResource}
          onClose={() => setIsAddAssignmentOpen(false)}
          onSave={handleSaveAssignment}
          defaultStart={filtres.dateDebut}
          defaultEnd={filtres.dateFin}
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

      <AddResourceModal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onSave={handleSaveResource}
      />
    </div>
  );
}
