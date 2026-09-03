import React from 'react';
import { StatsGlobales, FiltresRecherche } from '../types';
import { getNowDateTimeStr } from '../../shared/utils/dateHelpers';
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tv,
  Briefcase,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface DashboardProps {
  stats: StatsGlobales | null;
  filtres: FiltresRecherche;
  onNavigateToRecherche: (filtresPreset?: Partial<FiltresRecherche>) => void;
  dateDebutFormatted: string;
  dateFinFormatted: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onNavigateToRecherche,
  dateDebutFormatted,
  dateFinFormatted,
}) => {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Chargement des statistiques de disponibilité...</p>
      </div>
    );
  }

  const { totalRessources, totalAffectations, tauxOccupation, conflitsDetectes } = stats;

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #0C447C 100%)' }}>

        <div className="relative z-10 p-6 md:p-8 min-h-[190px] flex flex-col justify-between">
          <span className="self-start text-[11px] font-bold text-amber-900 bg-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Disponibilité RH
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Pilotez vos équipes
                <br />
                en temps réel
              </h2>
              <p className="text-xs text-emerald-50/80 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Période sous examen : <strong className="text-white">{dateDebutFormatted}</strong> au{' '}
                <strong className="text-white">{dateFinFormatted}</strong>
              </p>
            </div>

            <button
              onClick={() => onNavigateToRecherche()}
              className="self-start md:self-auto bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold px-5 py-2.5 rounded-full shadow transition-colors flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Consulter les disponibilités</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ressources Humaines</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalRessources}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Membres des équipes techniques & éditoriales</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Affectations</p>
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{totalAffectations}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5 font-medium">Planifiées sur la période</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-rose-50/60 dark:bg-rose-500/10 rounded-2xl p-4 border border-rose-200 dark:border-rose-800/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">Conflits Détectés</p>
            <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">{conflitsDetectes}</h3>
            <p className="text-[11px] text-rose-600 dark:text-rose-500 mt-0.5 font-medium">Article 3 - Chevauchements</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-sm">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Taux d'Occupation</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tauxOccupation}%</h3>
            <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${tauxOccupation}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-900/5 to-teal-900/5 dark:from-emerald-400/5 dark:to-teal-400/5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Scénarios de recherche rapide
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() =>
              onNavigateToRecherche({
                fonction: 'Cameraman',
                chaine: 'Al Aoula',
                dateDebut: getNowDateTimeStr(9, 0),
                dateFin: getNowDateTimeStr(14, 0),
              })
            }
            className="bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs transition-all group"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Cameramen Al Aoula (09h - 14h)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Consulter les cameramen disponibles aujourd'hui entre 09:00 et 14:00
            </p>
          </button>

          <button
            onClick={() =>
              onNavigateToRecherche({
                fonction: 'Réalisateur',
                chaine: 'Arryadia',
              })
            }
            className="bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs transition-all group"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Réalisateurs Arryadia</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Disponibilités des réalisateurs pour les retransmissions sportives
            </p>
          </button>

          <button
            onClick={() =>
              onNavigateToRecherche({
                fonction: 'Ingénieur du son',
              })
            }
            className="bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs transition-all group"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center justify-between">
              <span>Ingénieurs Son Disponibles</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Consulter les ingénieurs du son libres pour enregistrement studio
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};