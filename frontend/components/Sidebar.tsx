import React from 'react';
import { Calendar, LayoutDashboard, Search, FileText, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'recherche' | 'calendrier';
  setActiveTab: (tab: 'dashboard' | 'recherche' | 'calendrier') => void;
  onOpenExportModal: () => void;
  onOpenAdminPanel: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onOpenAdminPanel,
}) => {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  const initials = `${currentUser.nom.charAt(0)}${currentUser.nom.split(' ')[1]?.charAt(0) || ''}`.toUpperCase();

  const navButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
    }`;

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-white flex flex-col h-screen sticky top-0 z-30">
      <div className="p-5 flex items-center gap-2.5 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 p-1">
          <img src="/logo-snrt-icon.webp" alt="Logo SNRT" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight">
            RH <span className="text-emerald-400 font-extrabold">Live</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">Disponibilité RH — SNRT</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <button onClick={() => setActiveTab('dashboard')} className={navButtonClass(activeTab === 'dashboard')}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Tableau de bord</span>
        </button>
        <button onClick={() => setActiveTab('recherche')} className={navButtonClass(activeTab === 'recherche')}>
          <Search className="w-4 h-4 shrink-0" />
          <span>Recherche & Liste</span>
        </button>
        <button onClick={() => setActiveTab('calendrier')} className={navButtonClass(activeTab === 'calendrier')}>
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Vue Calendrier</span>
        </button>

        <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={onOpenExportModal}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-all"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Rapport / Export</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={onOpenAdminPanel}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Administration</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-emerald-950 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser.nom}</div>
            <div className="text-[10px] text-slate-500">
              {currentUser.role === 'admin' ? 'Administrateur' : 'Consultant'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-medium py-2.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};