import React from 'react';
import { RefreshCw, Calendar, LayoutDashboard, Search, FileText, UserPlus } from 'lucide-react';
import { SyncInfo } from '../types';

interface HeaderProps {
  syncInfo: SyncInfo;
  onTriggerSync: () => void;
  isSyncing: boolean;
  activeTab: 'dashboard' | 'recherche' | 'calendrier' | 'sync';
  setActiveTab: (tab: 'dashboard' | 'recherche' | 'calendrier' | 'sync') => void;
  onOpenExportModal: () => void;
  onOpenAddResourceModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  syncInfo,
  onTriggerSync,
  isSyncing,
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onOpenAddResourceModal,
}) => {
  const formattedSyncTime = new Date(syncInfo.derniereSynchro).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-emerald-900/30 p-1">
              <img src="/logo-snrt-icon.webp" alt="Logo SNRT" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                  mPlanner <span className="text-emerald-400 font-extrabold">V2</span>
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  Disponibilité RH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consultation en temps réel des ressources humaines audiovisuelles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">
                Dernière synchro : <strong className="text-white">{formattedSyncTime}</strong>
              </span>
            </div>

            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
              title="Forcer la synchronisation avec mPlanner V2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser'}</span>
            </button>

            {onOpenAddResourceModal && (
              <button
                onClick={onOpenAddResourceModal}
                className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Nouvel Agent RH</span>
              </button>
            )}

            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rapport / Export</span>
            </button>
          </div>
        </div>

        <nav className="flex space-x-1 mt-4 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveTab('recherche')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'recherche'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Recherche & Liste</span>
          </button>

          <button
            onClick={() => setActiveTab('calendrier')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'calendrier'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Vue Calendrier</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'sync'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Gestion mPlanner V2</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
