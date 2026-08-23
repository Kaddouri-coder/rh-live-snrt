import React from 'react';
import { Calendar, LayoutDashboard, Search, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { AppUser } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'recherche' | 'calendrier';
  setActiveTab: (tab: 'dashboard' | 'recherche' | 'calendrier') => void;
  onOpenExportModal: () => void;
  currentUser: AppUser;
  onOpenAdminPanel: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  currentUser,
  onOpenAdminPanel,
  onLogout,
}) => {
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
                  RH <span className="text-emerald-400 font-extrabold">Live</span>
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
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rapport / Export</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administration</span>
              </button>
            )}

            <div className="flex items-center space-x-2 pl-1">
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-xs font-semibold text-white">{currentUser.nom}</div>
                <div className="text-[10px] text-slate-400">
                  {currentUser.role === 'admin' ? 'Administrateur' : 'Consultant'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Déconnexion"
                className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
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
        </nav>
      </div>
    </header>
  );
};