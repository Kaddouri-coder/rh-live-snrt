import React, { useState } from 'react';
import { RessourceHumaine, Affectation } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarDays,
  CalendarRange,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { CHAINES_LIST, FONCTIONS_LIST } from '../data/constants';
import { FunctionSettingsModal } from './FunctionSettingsModal';
import { SearchableSelect } from './SearchableSelect';
import { getTodayStr, getDateStrPlusDays } from '../../shared/utils/dateHelpers';
import { ChannelBadge } from './ChannelBadge';
import { useAuth } from '../context/AuthContext';

interface CalendarViewProps {
  ressources: RessourceHumaine[];
  affectations: Affectation[];
  onSelectResource: (ressource: RessourceHumaine) => void;
  onSelectAffectation: (affectation: Affectation) => void;
  fonctionsAffichees?: string[];
  onUpdateFonctionsAffichees?: (fonctions: string[]) => void;
}

type ModeVue = 'jour' | 'semaine' | 'mois' | 'periode';

export const CalendarView: React.FC<CalendarViewProps> = ({
  ressources,
  affectations,
  onSelectResource,
  onSelectAffectation,
  fonctionsAffichees: externalFonctionsAffichees,
  onUpdateFonctionsAffichees,
}) => {
    const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Liste des fonctions réellement présentes dans les ressources (dynamique),
  // au lieu d'une liste statique qui peut être désynchronisée de la base.
  const allAvailableFonctions = Array.from(
    new Set(ressources.map((r) => r.fonction).filter(Boolean))
  ).sort();
  
  const [internalFonctionsAffichees, setInternalFonctionsAffichees] = useState<string[]>(allAvailableFonctions);
  const activeFonctions = externalFonctionsAffichees || internalFonctionsAffichees;

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [modeVue, setModeVue] = useState<ModeVue>('jour');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr());
  const [filterFonction, setFilterFonction] = useState<string>('Toutes les fonctions');
  const [filterChaine, setFilterChaine] = useState<string>('Toutes les chaînes');

  const handleSaveFonctions = (newFonctions: string[]) => {
    if (onUpdateFonctionsAffichees) {
      onUpdateFonctionsAffichees(newFonctions);
    } else {
      setInternalFonctionsAffichees(newFonctions);
    }
  };

  const [periodStart, setPeriodStart] = useState<string>(getTodayStr());
  const [periodEnd, setPeriodEnd] = useState<string>(getDateStrPlusDays(13));

  const [monthSubView, setMonthSubView] = useState<'matrix' | 'calendar'>('matrix');

  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const refDate = new Date(selectedDateStr + 'T00:00:00');

  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const getMonday = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const monday = getMonday(refDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const handlePrev = () => {
    if (modeVue === 'jour') {
      setSelectedDateStr(formatDateStr(addDays(refDate, -1)));
    } else if (modeVue === 'semaine') {
      setSelectedDateStr(formatDateStr(addDays(refDate, -7)));
    } else if (modeVue === 'mois') {
      const prevM = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
      setSelectedDateStr(formatDateStr(prevM));
    }
  };

  const handleNext = () => {
    if (modeVue === 'jour') {
      setSelectedDateStr(formatDateStr(addDays(refDate, 1)));
    } else if (modeVue === 'semaine') {
      setSelectedDateStr(formatDateStr(addDays(refDate, 7)));
    } else if (modeVue === 'mois') {
      const nextM = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
      setSelectedDateStr(formatDateStr(nextM));
    }
  };

  const filteredRessources = ressources.filter((r) => {
    if (activeFonctions.length > 0 && !activeFonctions.includes(r.fonction)) {
      return false;
    }
    if (filterFonction !== 'Toutes les fonctions' && r.fonction !== filterFonction) return false;
    if (filterChaine !== 'Toutes les chaînes' && r.chaineRattachement !== filterChaine) return false;
    return true;
  });

  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonthCount }, (_, i) => new Date(year, month, i + 1));

  const pStart = new Date(periodStart + 'T00:00:00');
  const pEnd = new Date(periodEnd + 'T23:59:59');
  const diffTime = Math.max(0, pEnd.getTime() - pStart.getTime());
  const diffDays = Math.min(60, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const customPeriodDays = Array.from({ length: diffDays }, (_, i) => addDays(pStart, i));

  const monthNameFr = refDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const applyPresetPeriod = (days: number) => {
    const start = new Date(getTodayStr() + 'T00:00:00');
    const end = addDays(start, days - 1);
    setPeriodStart(formatDateStr(start));
    setPeriodEnd(formatDateStr(end));
  };

  return (
    <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-lime/10 border border-lime/25 text-lime">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#eef3f4] flex items-center gap-2 tracking-tight">
              Vue Calendrier RH & Occupations
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lime/10 text-lime border border-lime/30 capitalize">
                {modeVue === 'jour' && 'Journée'}
                {modeVue === 'semaine' && 'Semaine'}
                {modeVue === 'mois' && 'Mois'}
                {modeVue === 'periode' && 'Période Personnalisée'}
              </span>
            </h2>
            <p className="text-xs text-[#6e7c84]">
              Visualisation temporelle des créneaux occupés et des plages de disponibilité
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/[0.03] p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setModeVue('jour')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'jour' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
              }`}
            >
              Journée
            </button>
            <button
              onClick={() => setModeVue('semaine')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'semaine' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setModeVue('mois')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'mois' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setModeVue('periode')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'periode' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
              }`}
            >
              Par Période
            </button>
          </div>

          {modeVue !== 'periode' && (
            <div className="flex items-center space-x-1.5 bg-white/[0.025] border border-white/[0.08] rounded-lg p-1">
              <button
                onClick={handlePrev}
                className="p-1 text-[#8b98a0] hover:bg-white/[0.07] hover:text-[#eef3f4] rounded transition-colors"
                title="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.09] rounded px-2 py-0.5 text-xs font-bold text-[#eef3f4] focus:outline-none [color-scheme:dark]"
              />
              <button
                onClick={handleNext}
                className="p-1 text-[#8b98a0] hover:bg-white/[0.07] hover:text-[#eef3f4] rounded transition-colors"
                title="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {modeVue === 'periode' && (
            <div className="flex items-center gap-2 bg-white/[0.025] border border-white/[0.08] rounded-lg p-1 text-xs">
              <span className="text-[#6e7c84] font-medium pl-1">Du</span>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.09] rounded px-2 py-0.5 font-bold text-[#eef3f4] focus:outline-none [color-scheme:dark]"
              />
              <span className="text-[#6e7c84] font-medium">Au</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.09] rounded px-2 py-0.5 font-bold text-[#eef3f4] focus:outline-none [color-scheme:dark]"
              />
            </div>
          )}
        </div>
      </div>

      {modeVue === 'periode' && (
        <div className="flex flex-wrap items-center gap-2 bg-lime/[0.06] p-2.5 rounded-lg border border-lime/20 text-xs">
          <span className="font-semibold text-lime flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Périodes Rapides :
          </span>
          <button
            onClick={() => applyPresetPeriod(7)}
            className="px-2.5 py-1 bg-white/[0.04] hover:bg-lime/10 text-lime border border-lime/25 rounded font-medium transition-colors"
          >
            7 Prochains Jours
          </button>
          <button
            onClick={() => applyPresetPeriod(14)}
            className="px-2.5 py-1 bg-white/[0.04] hover:bg-lime/10 text-lime border border-lime/25 rounded font-medium transition-colors"
          >
            14 Jours (2 Semaines)
          </button>
          <button
            onClick={() => applyPresetPeriod(30)}
            className="px-2.5 py-1 bg-white/[0.04] hover:bg-lime/10 text-lime border border-lime/25 rounded font-medium transition-colors"
          >
            30 Jours (1 Mois)
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.025] p-3 rounded-lg border border-white/[0.07] text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-[#8b98a0] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-lime" /> Filtrer les ressources :
          </span>

          <SearchableSelect
            options={FONCTIONS_LIST}
            value={filterFonction}
            onChange={setFilterFonction}
            className="w-48 sm:w-56"
          />

          <select
            value={filterChaine}
            onChange={(e) => setFilterChaine(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.09] rounded px-2.5 py-1 text-xs font-medium text-[#eef3f4] focus:outline-none"
          >
            {CHAINES_LIST.map((c) => (
              <option key={c} value={c} className="bg-[#0d1217]">
                {c}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-lime hover:bg-[#c4ff69] text-[#0a1109] rounded-md text-xs font-bold transition-all"
              title="Gérer les fonctions RH affichées"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Paramétrage des fonctions ({activeFonctions.length}/{allAvailableFonctions.length})
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-lime">
            <span className="w-2.5 h-2.5 bg-lime/15 border border-lime/50 rounded-xs inline-block"></span>
            Plage Libre
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs inline-block"></span>
            Occupée
          </span>
        </div>
      </div>

      {modeVue === 'jour' && (
        <>
          {/* Vue grille horaire — desktop/tablette (scroll horizontal acceptable ici) */}
          <div className="hidden md:block overflow-x-auto border border-white/[0.09] rounded-xl">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-black/30 text-[#9aa5aa] text-xs font-semibold">
                  <th className="py-2.5 px-3 border-b border-white/[0.08] w-64 sticky left-0 bg-[#0e1518] z-10">
                    Ressource Humaine
                  </th>
                  {hours.map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-1 border-b border-white/[0.08] text-center font-mono text-[11px] w-12"
                    >
                      {h < 10 ? `0${h}` : h}:00
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredRessources.map((res) => {
                  const dayStart = new Date(`${selectedDateStr}T00:00:00.000`);
                  const dayEnd = new Date(`${selectedDateStr}T23:59:59.999`);

                  const resAffectations = affectations.filter((aff) => {
                    if (aff.ressourceId !== res.id) return false;
                    const aStart = new Date(aff.dateDebut);
                    const aEnd = new Date(aff.dateFin);
                    return aStart < dayEnd && aEnd > dayStart;
                  });

                  return (
                    <tr key={res.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="py-2.5 px-3 font-medium text-[#eef3f4] border-r border-white/[0.08] sticky left-0 bg-[#0e1518] z-10">
                        <button
                          onClick={() => onSelectResource(res)}
                          className="text-left font-bold hover:text-lime transition-colors block text-xs"
                        >
                          {res.prenom} {res.nom}
                        </button>
                        <div className="text-[10px] text-[#6e7c84] font-mono flex items-center justify-between mt-0.5">
                          <span>{res.fonction}</span>
                          <span className="bg-white/[0.05] text-[#8b98a0] px-1 rounded">
                            <ChannelBadge name={res.chaineRattachement} />
                          </span>
                        </div>
                      </td>

                      {hours.map((hour) => {
                        const slotStart = new Date(
                          `${selectedDateStr}T${hour < 10 ? '0' + hour : hour}:00:00.000`
                        );
                        const slotEnd = new Date(
                          `${selectedDateStr}T${hour < 10 ? '0' + hour : hour}:59:59.999`
                        );

                        const matchingAff = resAffectations.find((aff) => {
                          const affStart = new Date(aff.dateDebut);
                          const affEnd = new Date(aff.dateFin);
                          return slotStart < affEnd && slotEnd > affStart;
                        });

                        if (matchingAff) {
                          return (
                            <td
                              key={hour}
                              onClick={() => onSelectAffectation(matchingAff)}
                              className="py-1 px-0.5 border-r border-white/[0.05] bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-[10px] text-center font-bold p-1 overflow-hidden"
                              title={`OCCUPÉE : ${matchingAff.emissionNom} (${matchingAff.lieu}) - Cliquez pour détails`}
                            >
                              <div className="truncate px-0.5">{matchingAff.emissionNom.slice(0, 8)}..</div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={hour}
                            className="py-2 px-0.5 border-r border-white/[0.05] bg-lime/[0.04] hover:bg-lime/10 transition-colors text-center text-[10px]"
                            title={`LIBRE à ${hour}:00`}
                          >
                            <div className="w-1.5 h-1.5 bg-lime rounded-full mx-auto opacity-40"></div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vue agenda verticale — mobile (pas de scroll horizontal) */}
          <div className="md:hidden space-y-2">
            {filteredRessources.length === 0 && (
              <div className="text-center text-xs text-[#5f6d75] py-8 bg-white/[0.02] rounded-xl border border-white/[0.07]">
                Aucune ressource ne correspond aux filtres actuels.
              </div>
            )}

            {filteredRessources.map((res) => {
              const dayStart = new Date(`${selectedDateStr}T00:00:00.000`);
              const dayEnd = new Date(`${selectedDateStr}T23:59:59.999`);

              const resAffectations = affectations
                .filter((aff) => {
                  if (aff.ressourceId !== res.id) return false;
                  const aStart = new Date(aff.dateDebut);
                  const aEnd = new Date(aff.dateFin);
                  return aStart < dayEnd && aEnd > dayStart;
                })
                .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

              const isFree = resAffectations.length === 0;

              return (
                <div
                  key={res.id}
                  className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => onSelectResource(res)} className="text-left min-w-0">
                      <div className="font-bold text-sm text-[#eef3f4] hover:text-lime transition-colors truncate">
                        {res.prenom} {res.nom}
                      </div>
                      <div className="text-[11px] text-[#6e7c84] truncate flex items-center gap-1">
                        {res.fonction} · <ChannelBadge name={res.chaineRattachement} />
                      </div>
                    </button>
                    {isFree ? (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-lime/10 text-lime border border-lime/30">
                        Libre
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {resAffectations.length} occ.
                      </span>
                    )}
                  </div>

                  {!isFree && (
                    <div className="space-y-1.5 pt-2 mt-2 border-t border-white/[0.07]">
                      {resAffectations.map((aff) => (
                        <button
                          key={aff.id}
                          onClick={() => onSelectAffectation(aff)}
                          className="w-full text-left flex items-center gap-2 text-xs bg-rose-500/[0.06] hover:bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-2 transition-colors"
                        >
                          <span className="font-mono text-[10px] font-bold text-rose-400 shrink-0">
                            {new Date(aff.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}–
                            {new Date(aff.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="truncate text-[#c1cdcf] font-medium">{aff.emissionNom}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {modeVue === 'semaine' && (
        <div className="space-y-4">
          <div className="bg-lime/[0.06] border border-lime/20 rounded-lg p-3 text-xs flex justify-between items-center text-lime font-medium">
            <span>
              Semaine du <strong>{formatDateStr(weekDays[0])}</strong> au{' '}
              <strong>{formatDateStr(weekDays[6])}</strong>
            </span>
            <span className="text-[#6e7c84] text-[11px]">
              {filteredRessources.length} ressources filtrées
            </span>
          </div>

          <div className="overflow-x-auto border border-white/[0.09] rounded-xl">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/30 text-[#9aa5aa] text-xs font-semibold">
                  <th className="py-2.5 px-3 border-b border-white/[0.08] w-64 sticky left-0 bg-[#0e1518] z-10">
                    Ressource Humaine
                  </th>
                  {weekDays.map((day) => {
                    const dayStr = formatDateStr(day);
                    const isSelected = dayStr === selectedDateStr;
                    return (
                      <th
                        key={dayStr}
                        className={`py-2 px-2 border-b border-white/[0.08] text-center text-[11px] ${
                          isSelected ? 'bg-lime/10 text-lime font-bold' : ''
                        }`}
                      >
                        <div className="capitalize">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div className="text-[10px] text-[#8b98a0] font-mono">{day.getDate()} / {day.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredRessources.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#eef3f4] border-r border-white/[0.08] sticky left-0 bg-[#0e1518] z-10">
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-left font-bold hover:text-lime transition-colors block text-xs"
                      >
                        {res.prenom} {res.nom}
                      </button>
                      <div className="text-[10px] text-[#6e7c84] font-mono flex items-center justify-between mt-0.5">
                        <span>{res.fonction}</span>
                        <span className="bg-white/[0.05] text-[#8b98a0] px-1 rounded">
                            <ChannelBadge name={res.chaineRattachement} />
                          </span>
                      </div>
                    </td>

                    {weekDays.map((day) => {
                      const dayStr = formatDateStr(day);
                      const dStart = new Date(`${dayStr}T00:00:00.000`);
                      const dEnd = new Date(`${dayStr}T23:59:59.999`);

                      const dayAffectations = affectations.filter((aff) => {
                        if (aff.ressourceId !== res.id) return false;
                        const aStart = new Date(aff.dateDebut);
                        const aEnd = new Date(aff.dateFin);
                        return aStart < dEnd && aEnd > dStart;
                      });

                      if (dayAffectations.length > 0) {
                        return (
                          <td key={dayStr} className="p-1 border-r border-white/[0.05] bg-rose-500/[0.08]">
                            <div className="space-y-1">
                              {dayAffectations.map((aff) => (
                                <div
                                  key={aff.id}
                                  onClick={() => onSelectAffectation(aff)}
                                  className="bg-rose-500 hover:bg-rose-600 transition-colors text-white text-[10px] p-1 rounded font-medium cursor-pointer"
                                  title={`${aff.emissionNom} (${aff.statut}) - Cliquez pour voir`}
                                >
                                  <div className="font-bold truncate">{aff.emissionNom}</div>
                                  <div className="text-[9px] opacity-90 truncate">{aff.lieu}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={dayStr} className="p-2 border-r border-white/[0.05] bg-lime/[0.03] text-center">
                          <span className="text-[10px] text-lime font-medium">Libre</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modeVue === 'mois' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-lg border border-white/[0.08]">
            <h3 className="text-sm font-semibold text-[#eef3f4] capitalize flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-lime" />
              Mois : {monthNameFr}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8b98a0] font-medium">Affichage :</span>
              <button
                onClick={() => setMonthSubView('matrix')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  monthSubView === 'matrix' ? 'bg-lime text-[#0a1109]' : 'bg-white/[0.03] text-[#8b98a0] border border-white/[0.09]'
                }`}
              >
                Grille Ressources (Jours 1-{daysInMonthCount})
              </button>
              <button
                onClick={() => setMonthSubView('calendar')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  monthSubView === 'calendar' ? 'bg-lime text-[#0a1109]' : 'bg-white/[0.03] text-[#8b98a0] border border-white/[0.09]'
                }`}
              >
                Calendrier Mensuel
              </button>
            </div>
          </div>

          {monthSubView === 'matrix' ? (
            <div className="overflow-x-auto border border-white/[0.09] rounded-xl">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-black/30 text-[#9aa5aa] text-xs font-semibold">
                    <th className="py-2.5 px-3 border-b border-white/[0.08] w-60 sticky left-0 bg-[#0e1518] z-10">
                      Ressource Humaine
                    </th>
                    {monthDays.map((d) => (
                      <th
                        key={d.getDate()}
                        className="py-2 px-1 border-b border-white/[0.08] text-center font-mono text-[10px] w-8"
                      >
                        <div>{d.getDate()}</div>
                        <div className="text-[8px] text-[#6e7c84] capitalize">
                          {d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs">
                  {filteredRessources.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="py-2 px-3 font-medium text-[#eef3f4] border-r border-white/[0.08] sticky left-0 bg-[#0e1518] z-10">
                        <button
                          onClick={() => onSelectResource(res)}
                          className="text-left font-bold hover:text-lime transition-colors block text-xs truncate w-48"
                        >
                          {res.prenom} {res.nom}
                        </button>
                        <div className="text-[10px] text-[#6e7c84] font-mono flex items-center justify-between mt-0.5">
                          <span>{res.fonction}</span>
                          <span className="bg-white/[0.05] text-[#8b98a0] px-1 rounded">
                            <ChannelBadge name={res.chaineRattachement} />
                          </span>
                        </div>
                      </td>

                      {monthDays.map((d) => {
                        const dayStr = formatDateStr(d);
                        const dStart = new Date(`${dayStr}T00:00:00.000`);
                        const dEnd = new Date(`${dayStr}T23:59:59.999`);

                        const matchingAff = affectations.find((aff) => {
                          if (aff.ressourceId !== res.id) return false;
                          const aStart = new Date(aff.dateDebut);
                          const aEnd = new Date(aff.dateFin);
                          return aStart < dEnd && aEnd > dStart;
                        });

                        if (matchingAff) {
                          return (
                            <td
                              key={d.getDate()}
                              onClick={() => onSelectAffectation(matchingAff)}
                              className="p-1 border-r border-white/[0.05] bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-center text-[10px] font-bold"
                              title={`${res.prenom} ${res.nom} - ${matchingAff.emissionNom}`}
                            >
                              •
                            </td>
                          );
                        }

                        return (
                          <td
                            key={d.getDate()}
                            className="p-1 border-r border-white/[0.05] bg-lime/[0.04] text-center text-[10px]"
                          >
                            <div className="w-1 h-1 bg-lime rounded-full mx-auto opacity-50"></div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 bg-white/[0.05] p-1.5 rounded-xl border border-white/[0.08] min-w-[640px]">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayHeader) => (
                  <div key={dayHeader} className="bg-black/30 text-[#9aa5aa] font-bold text-center py-2 text-xs rounded">
                    {dayHeader}
                  </div>
                ))}

                {monthDays.map((d) => {
                  const dayStr = formatDateStr(d);
                  const dStart = new Date(`${dayStr}T00:00:00.000`);
                  const dEnd = new Date(`${dayStr}T23:59:59.999`);

                  const dayAffectations = affectations.filter((aff) => {
                    const aStart = new Date(aff.dateDebut);
                    const aEnd = new Date(aff.dateFin);
                    return aStart < dEnd && aEnd > dStart;
                  });

                  return (
                    <div key={dayStr} className="bg-[#0d1217] p-2 min-h-[90px] rounded border border-white/[0.07] flex flex-col justify-between">
                      <div className="flex justify-between items-center text-xs font-bold text-[#eef3f4]">
                        <span>{d.getDate()}</span>
                        {dayAffectations.length > 0 && (
                          <span className="text-[10px] bg-rose-500/15 text-rose-300 px-1.5 py-0.5 rounded-full font-extrabold">
                            {dayAffectations.length} occ.
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 my-1 overflow-hidden max-h-[50px]">
                        {dayAffectations.slice(0, 2).map((aff) => (
                          <div
                            key={aff.id}
                            onClick={() => onSelectAffectation(aff)}
                            className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-300 p-1 rounded font-medium truncate cursor-pointer hover:bg-rose-500/20"
                          >
                            {aff.emissionNom}
                          </div>
                        ))}
                        {dayAffectations.length > 2 && (
                          <div className="text-[9px] text-[#6e7c84] font-semibold text-center">
                            +{dayAffectations.length - 2} autres...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {modeVue === 'periode' && (
        <div className="space-y-4">
          <div className="bg-black/30 text-[#eef3f4] p-4 rounded-xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-lime" />
                Analyse de la Période du {periodStart} au {periodEnd}
              </h3>
              <p className="text-xs text-[#8b98a0] mt-0.5">
                Période de {customPeriodDays.length} jour(s) sélectionné(s)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-lg text-center">
                <div className="text-[#8b98a0] text-[10px]">Ressources Filtre</div>
                <div className="text-lime font-bold text-sm">{filteredRessources.length}</div>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-lg text-center">
                <div className="text-[#8b98a0] text-[10px]">Affectations Totales</div>
                <div className="text-rose-400 font-bold text-sm">
                  {
                    affectations.filter((aff) => {
                      const aStart = new Date(aff.dateDebut);
                      const aEnd = new Date(aff.dateFin);
                      return aStart < pEnd && aEnd > pStart;
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-white/[0.09] rounded-xl">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/30 text-[#9aa5aa] text-xs font-semibold">
                  <th className="py-2.5 px-3 border-b border-white/[0.08] w-52 sticky left-0 bg-[#0e1518] z-10">
                    Ressource Humaine
                  </th>
                  {customPeriodDays.map((d) => (
                    <th
                      key={formatDateStr(d)}
                      className="py-2 px-1 border-b border-white/[0.08] text-center font-mono text-[10px] w-12"
                    >
                      <div className="capitalize">{d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</div>
                      <div className="text-[9px] text-[#8b98a0]">{d.getDate()}/{d.getMonth() + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredRessources.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#eef3f4] border-r border-white/[0.08] sticky left-0 bg-[#0e1518] z-10">
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-left font-bold hover:text-lime transition-colors block text-xs"
                      >
                        {res.prenom} {res.nom}
                      </button>
                      <div className="text-[10px] text-[#6e7c84] font-mono flex items-center justify-between mt-0.5">
                        <span>{res.fonction}</span>
                        <span className="bg-white/[0.05] text-[#8b98a0] px-1 rounded">
                            <ChannelBadge name={res.chaineRattachement} />
                          </span>
                      </div>
                    </td>

                    {customPeriodDays.map((d) => {
                      const dayStr = formatDateStr(d);
                      const dStart = new Date(`${dayStr}T00:00:00.000`);
                      const dEnd = new Date(`${dayStr}T23:59:59.999`);

                      const matchingAff = affectations.find((aff) => {
                        if (aff.ressourceId !== res.id) return false;
                        const aStart = new Date(aff.dateDebut);
                        const aEnd = new Date(aff.dateFin);
                        return aStart < dEnd && aEnd > dStart;
                      });

                      if (matchingAff) {
                        return (
                          <td
                            key={dayStr}
                            onClick={() => onSelectAffectation(matchingAff)}
                            className="p-1 border-r border-white/[0.05] bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-center text-[10px] font-bold"
                            title={`${matchingAff.emissionNom} (${matchingAff.lieu})`}
                          >
                            <div className="truncate text-[9px]">{matchingAff.emissionNom.slice(0, 5)}</div>
                          </td>
                        );
                      }

                      return (
                        <td key={dayStr} className="p-1 border-r border-white/[0.05] bg-lime/[0.04] text-center text-[10px]">
                          <div className="w-1.5 h-1.5 bg-lime rounded-full mx-auto opacity-40"></div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FunctionSettingsModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        selectedFonctions={activeFonctions}
        onSaveFonctions={handleSaveFonctions}
        ressources={ressources}
      />
    </div>
  );
};