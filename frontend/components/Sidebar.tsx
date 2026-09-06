import React, { useState } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Search,
  FileText,
  ShieldCheck,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  if (!currentUser) return null;

  const initials = `${currentUser.nom.charAt(0)}${currentUser.nom.split(' ')[1]?.charAt(0) || ''}`.toUpperCase();

  const navButtonClass = (isActive: boolean) =>
    `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
      isCollapsed ? 'md:justify-center md:px-0' : ''
    } ${
      isActive
        ? 'text-[#eaf4ef] bg-gradient-to-r from-lime/[0.14] to-lime/[0.03]'
        : 'text-[#7c8990] hover:text-[#e6edef] hover:bg-white/[0.05]'
    }`;

  const handleNavClick = (tab: 'dashboard' | 'recherche' | 'calendrier') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`w-64 shrink-0 bg-gradient-to-b from-[#080d11] to-[#070c0f] text-[#eaf0f2] flex flex-col h-screen fixed md:sticky top-0 left-0 z-40 border-r border-white/[0.07] transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'md:w-[78px]' : 'md:w-64'}`}
      >
        <div className={`min-h-[58px] flex items-center gap-2.5 px-3.5 pt-5 pb-4 ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}>
          <div className="relative w-10 h-10 shrink-0 rounded-lg bg-white/[0.06] border border-lime/20 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(183,255,74,0.08)]">
            <img src="/logo-snrt-icon.webp" alt="Logo SNRT" className="w-full h-full object-contain" />
          </div>
          <div className={`min-w-0 flex-1 leading-none ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="font-display font-bold text-[15px] tracking-tight text-[#f0f6f5] whitespace-nowrap">
              RH live
            </div>
            <div className="mt-1 text-[8px] font-bold tracking-[0.16em] text-[#66737b] whitespace-nowrap">
              SNRT · RESOURCE FLOW
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer le menu" className="md:hidden text-[#65727a] hover:text-lime p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            aria-label={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            className={`hidden md:grid place-items-center w-7 h-7 rounded-md text-[#65727a] hover:text-lime transition-colors ${
              isCollapsed ? 'md:hidden' : ''
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Agrandir le menu"
            aria-label="Agrandir le menu"
            className="hidden md:grid place-items-center w-7 h-7 mx-auto -mt-1 mb-2 rounded-md text-[#65727a] hover:text-lime transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div className={`mt-2 mb-2.5 px-3.5 text-[9px] font-bold tracking-[0.18em] uppercase text-[#4f5c64] ${isCollapsed ? 'md:hidden' : ''}`}>
          Consulter
        </div>
        <nav className="px-3 flex flex-col gap-1">
          <button onClick={() => handleNavClick('dashboard')} className={navButtonClass(activeTab === 'dashboard')} title="Tableau de bord">
            {activeTab === 'dashboard' && (
              <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-lime shadow-[0_0_10px_theme(colors.lime)] rounded-full" />
            )}
            <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={activeTab === 'dashboard' ? 2.2 : 1.7} />
            <span className={isCollapsed ? 'md:hidden' : ''}>Tableau de bord</span>
            {activeTab === 'dashboard' && !isCollapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" />
            )}
          </button>
          <button onClick={() => handleNavClick('recherche')} className={navButtonClass(activeTab === 'recherche')} title="Recherche & Liste">
            {activeTab === 'recherche' && (
              <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-lime shadow-[0_0_10px_theme(colors.lime)] rounded-full" />
            )}
            <Search className="w-4 h-4 shrink-0" strokeWidth={activeTab === 'recherche' ? 2.2 : 1.7} />
            <span className={isCollapsed ? 'md:hidden' : ''}>Recherche & Liste</span>
            {activeTab === 'recherche' && !isCollapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" />
            )}
          </button>
          <button onClick={() => handleNavClick('calendrier')} className={navButtonClass(activeTab === 'calendrier')} title="Vue Calendrier">
            {activeTab === 'calendrier' && (
              <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-lime shadow-[0_0_10px_theme(colors.lime)] rounded-full" />
            )}
            <Calendar className="w-4 h-4 shrink-0" strokeWidth={activeTab === 'calendrier' ? 2.2 : 1.7} />
            <span className={isCollapsed ? 'md:hidden' : ''}>Vue Calendrier</span>
            {activeTab === 'calendrier' && !isCollapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" />
            )}
          </button>
        </nav>

        <div className={`mt-6 mb-2.5 px-3.5 text-[9px] font-bold tracking-[0.18em] uppercase text-[#4f5c64] ${isCollapsed ? 'md:hidden' : ''}`}>
          Piloter
        </div>
        <nav className="px-3 flex flex-col gap-1">
          <button
            onClick={() => {
              onOpenExportModal();
              onClose();
            }}
            title="Rapport / Export"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[#7c8990] hover:text-[#e6edef] hover:bg-white/[0.05] transition-all ${
              isCollapsed ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" strokeWidth={1.7} />
            <span className={isCollapsed ? 'md:hidden' : ''}>Rapport / Export</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                onOpenAdminPanel();
                onClose();
              }}
              title="Administration"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-cyan/90 hover:text-cyan hover:bg-cyan/[0.06] transition-all ${
                isCollapsed ? 'md:justify-center md:px-0' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.7} />
              <span className={isCollapsed ? 'md:hidden' : ''}>Administration</span>
            </button>
          )}
        </nav>

        <div className="flex-1 min-h-6" />

        <div className="px-3 pb-3.5">
          <div
            className={`relative flex items-center gap-2.5 min-h-[50px] mb-2.5 px-2.5 rounded-lg border border-cyan/10 bg-gradient-to-r from-cyan/[0.08] to-white/[0.02] overflow-hidden ${
              isCollapsed ? 'md:justify-center md:border-0 md:bg-transparent md:px-0' : ''
            }`}
          >
            <div className="relative w-6 h-6 shrink-0 rounded-full border border-cyan/50">
              <div className="absolute inset-1 rounded-full border border-lime/50" />
            </div>
            <div className={`flex flex-col gap-0.5 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
              <span className="text-[9px] text-[#72828a] whitespace-nowrap">SNRT · Synchronisation</span>
              <strong className="text-[10px] font-semibold text-[#dfe8e9] whitespace-nowrap">Flux disponible</strong>
            </div>
            <span className={`ml-auto w-[5px] h-[5px] rounded-full bg-lime shadow-[0_0_9px_theme(colors.lime)] ${isCollapsed ? 'md:hidden' : ''}`} />
          </div>

          <div className={`flex items-center gap-2.5 px-1.5 py-2 mb-1.5 border-t border-white/[0.07] ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-[30px] h-[30px] shrink-0 rounded-full grid place-items-center font-display text-[9px] font-extrabold text-[#0c130d] bg-gradient-to-br from-lime to-emerald-300">
              {initials}
            </div>
            <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
              <div className="text-[11px] font-semibold text-[#dfe8e9] truncate">{currentUser.nom}</div>
              <div className="text-[9px] text-[#66737b]">
                {currentUser.role === 'admin' ? 'Administrateur' : 'Consultant'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Déconnexion"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/30 text-[#9aa5aa] hover:text-rose-300 text-xs font-medium py-2.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};