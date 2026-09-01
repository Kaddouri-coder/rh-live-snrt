import React, { useState } from 'react';
import { Calendar, LayoutDashboard, Search, FileText, ShieldCheck, LogOut, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'recherche' | 'calendrier';
  setActiveTab: (tab: 'dashboard' | 'recherche' | 'calendrier') => void;
  onOpenExportModal: () => void;
  onOpenAdminPanel: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onOpenAdminPanel,
  isOpen,
  onClose,
}) => {
  const { currentUser, logout } = useAuth();
  // Réduit la sidebar à une bande d'icônes sur desktop (n'affecte pas le tiroir mobile).
  const [isCollapsed, setIsCollapsed] = useState(false);
  if (!currentUser) return null;

  const initials = `${currentUser.nom.charAt(0)}${currentUser.nom.split(' ')[1]?.charAt(0) || ''}`.toUpperCase();

  const navButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium transition-all ${
      isCollapsed ? 'md:justify-center md:px-0' : ''
    } ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
    }`;

  const handleNavClick = (tab: 'dashboard' | 'recherche' | 'calendrier') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`w-64 shrink-0 bg-slate-900 text-white flex flex-col h-screen fixed md:sticky top-0 left-0 z-40 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'md:w-[76px]' : 'md:w-60'}`}
      >
        <div className={`p-5 flex items-center gap-2.5 border-b border-slate-800/80 ${isCollapsed ? 'md:justify-center md:px-3' : ''}`}>
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 p-1">
            <img src="/logo-snrt-icon.webp" alt="Logo SNRT" className="w-full h-full object-contain" />
          </div>
          <div className={`min-w-0 flex-1 ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="text-sm font-bold leading-tight">
              RH <span className="text-emerald-400 font-extrabold">Live</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Disponibilité RH — SNRT</div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bouton de réduction/agrandissement (visible uniquement sur desktop) */}
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          className={`hidden md:flex items-center gap-2 px-3 py-2 mx-3 mt-2 text-[11px] font-medium text-slate-500 hover:text-slate-200 hover:bg-slate-800/70 rounded-full transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isCollapsed ? <ChevronsRight className="w-4 h-4 shrink-0" /> : <ChevronsLeft className="w-4 h-4 shrink-0" />}
          {!isCollapsed && <span>Réduire</span>}
        </button>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button onClick={() => handleNavClick('dashboard')} className={navButtonClass(activeTab === 'dashboard')} title="Tableau de bord">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Tableau de bord</span>
          </button>
          <button onClick={() => handleNavClick('recherche')} className={navButtonClass(activeTab === 'recherche')} title="Recherche & Liste">
            <Search className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Recherche & Liste</span>
          </button>
          <button onClick={() => handleNavClick('calendrier')} className={navButtonClass(activeTab === 'calendrier')} title="Vue Calendrier">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Vue Calendrier</span>
          </button>

          <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1">
            <button
              onClick={() => {
                onOpenExportModal();
                onClose();
              }}
              title="Rapport / Export"
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-all ${
                isCollapsed ? 'md:justify-center md:px-0' : ''
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>Rapport / Export</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  onClose();
                }}
                title="Administration"
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all ${
                  isCollapsed ? 'md:justify-center md:px-0' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>Administration</span>
              </button>
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800/80">
          <div className={`flex items-center gap-2.5 px-2 py-1.5 mb-2 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-emerald-950 shrink-0">
              {initials}
            </div>
            <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
              <div className="text-xs font-semibold text-white truncate">{currentUser.nom}</div>
              <div className="text-[10px] text-slate-500">
                {currentUser.role === 'admin' ? 'Administrateur' : 'Consultant'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-medium py-2.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};