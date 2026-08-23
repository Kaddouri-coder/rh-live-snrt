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

interface CalendarViewProps {
  ressources: RessourceHumaine[];
  affectations: Affectation[];
  onSelectResource: (ressource: RessourceHumaine) => void;
  onSelectAffectation: (affectation: Affectation) => void;
  fonctionsAffichees?: string[];
  onUpdateFonctionsAffichees?: (fonctions: string[]) => void;
}

type ModeVue = 'jour' | 'semaine' | 'mois' | 'periode';

// Renvoie la date d'aujourd'hui (heure locale) au format "YYYY-MM-DD"
function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Renvoie la date "aujourd'hui + N jours" au format "YYYY-MM-DD"
function getDateStrPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  ressources,
  affectations,
  onSelectResource,
  onSelectAffectation,
  fonctionsAffichees: externalFonctionsAffichees,
  onUpdateFonctionsAffichees,
}) => {
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Vue Calendrier RH & Occupations
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 capitalize">
                {modeVue === 'jour' && 'Journée'}
                {modeVue === 'semaine' && 'Semaine'}
                {modeVue === 'mois' && 'Mois'}
                {modeVue === 'periode' && 'Période Personnalisée'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Visualisation temporelle des créneaux occupés et des plages de disponibilité
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setModeVue('jour')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'jour'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journée
            </button>
            <button
              onClick={() => setModeVue('semaine')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'semaine'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setModeVue('mois')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'mois'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setModeVue('periode')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modeVue === 'periode'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Par Période
            </button>
          </div>

          {modeVue !== 'periode' && (
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button
                onClick={handlePrev}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                title="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
              />
              <button
                onClick={handleNext}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                title="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {modeVue === 'periode' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <span className="text-slate-500 font-medium pl-1">Du</span>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-slate-500 font-medium">Au</span>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {modeVue === 'periode' && (
        <div className="flex flex-wrap items-center gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 text-xs">
          <span className="font-semibold text-emerald-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Périodes Rapides :
          </span>
          <button
            onClick={() => applyPresetPeriod(7)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-medium transition-colors"
          >
            7 Prochains Jours
          </button>
          <button
            onClick={() => applyPresetPeriod(14)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-medium transition-colors"
          >
            14 Jours (2 Semaines)
          </button>
          <button
            onClick={() => applyPresetPeriod(30)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-medium transition-colors"
          >
            30 Jours (1 Mois)
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" /> Filtrer les ressources :
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
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none"
          >
            {CHAINES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shadow-2xs"
            title="Gérer les fonctions RH affichées"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Paramétrage des fonctions ({activeFonctions.length}/{allAvailableFonctions.length})
          </button>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-400 rounded-xs inline-block"></span>
            Plage Libre
          </span>
          <span className="flex items-center gap-1 text-rose-800">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs inline-block"></span>
            Occupée
          </span>
        </div>
      </div>

      {modeVue === 'jour' && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 text-slate-200 text-xs font-semibold">
                <th className="py-2.5 px-3 border-b border-slate-700 w-52 sticky left-0 bg-slate-800 z-10">
                  Ressource Humaine
                </th>
                {hours.map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-1 border-b border-slate-700 text-center font-mono text-[11px] w-12"
                  >
                    {h < 10 ? `0${h}` : h}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
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
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-xs">
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-left font-bold hover:text-emerald-600 transition-colors block text-xs"
                      >
                        {res.prenom} {res.nom}
                      </button>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span>{res.fonction}</span>
                        <span className="bg-slate-100 text-slate-600 px-1 rounded">
                          {res.chaineRattachement}
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
                            className="py-1 px-0.5 border-r border-slate-100 bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-[10px] text-center font-bold p-1 overflow-hidden"
                            title={`OCCUPÉE : ${matchingAff.emissionNom} (${matchingAff.lieu}) - Cliquez pour détails`}
                          >
                            <div className="truncate px-0.5">{matchingAff.emissionNom.slice(0, 8)}..</div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={hour}
                          className="py-2 px-0.5 border-r border-slate-100 bg-emerald-50/40 hover:bg-emerald-100/50 transition-colors text-center text-emerald-800 text-[10px]"
                          title={`LIBRE à ${hour}:00`}
                        >
                          <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full mx-auto opacity-40"></div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modeVue === 'semaine' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs flex justify-between items-center text-emerald-900 font-medium">
            <span>
              Semaine du <strong>{formatDateStr(weekDays[0])}</strong> au{' '}
              <strong>{formatDateStr(weekDays[6])}</strong>
            </span>
            <span className="text-slate-500 text-[11px]">
              {filteredRessources.length} ressources filtrées
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-800 text-slate-200 text-xs font-semibold">
                  <th className="py-2.5 px-3 border-b border-slate-700 w-52 sticky left-0 bg-slate-800 z-10">
                    Ressource Humaine
                  </th>
                  {weekDays.map((day) => {
                    const dayStr = formatDateStr(day);
                    const isSelected = dayStr === selectedDateStr;
                    return (
                      <th
                        key={dayStr}
                        className={`py-2 px-2 border-b border-slate-700 text-center text-[11px] ${
                          isSelected ? 'bg-slate-700 text-emerald-300 font-bold' : ''
                        }`}
                      >
                        <div className="capitalize">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div className="text-[10px] text-slate-300 font-mono">{day.getDate()} / {day.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRessources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-xs">
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-left font-bold hover:text-emerald-600 transition-colors block text-xs"
                      >
                        {res.prenom} {res.nom}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">{res.fonction}</span>
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
                          <td key={dayStr} className="p-1 border-r border-slate-100 bg-rose-50/80">
                            <div className="space-y-1">
                              {dayAffectations.map((aff) => (
                                <div
                                  key={aff.id}
                                  onClick={() => onSelectAffectation(aff)}
                                  className="bg-rose-500 hover:bg-rose-600 transition-colors text-white text-[10px] p-1 rounded font-medium cursor-pointer shadow-2xs"
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
                        <td key={dayStr} className="p-2 border-r border-slate-100 bg-emerald-50/20 text-center">
                          <span className="text-[10px] text-emerald-700 font-medium">Libre</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              Mois : {monthNameFr}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-medium">Affichage :</span>
              <button
                onClick={() => setMonthSubView('matrix')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  monthSubView === 'matrix' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                Grille Ressources (Jours 1-{daysInMonthCount})
              </button>
              <button
                onClick={() => setMonthSubView('calendar')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  monthSubView === 'calendar' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                Calendrier Mensuel
              </button>
            </div>
          </div>

          {monthSubView === 'matrix' ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-800 text-slate-200 text-xs font-semibold">
                    <th className="py-2.5 px-3 border-b border-slate-700 w-48 sticky left-0 bg-slate-800 z-10">
                      Ressource Humaine
                    </th>
                    {monthDays.map((d) => (
                      <th
                        key={d.getDate()}
                        className="py-2 px-1 border-b border-slate-700 text-center font-mono text-[10px] w-8"
                      >
                        <div>{d.getDate()}</div>
                        <div className="text-[8px] text-slate-400 capitalize">
                          {d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredRessources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-xs">
                        <button
                          onClick={() => onSelectResource(res)}
                          className="text-left font-bold hover:text-emerald-600 transition-colors block text-xs truncate w-40"
                        >
                          {res.prenom} {res.nom}
                        </button>
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
                              className="p-1 border-r border-slate-100 bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-center text-[10px] font-bold"
                              title={`${res.prenom} ${res.nom} - ${matchingAff.emissionNom}`}
                            >
                              •
                            </td>
                          );
                        }

                        return (
                          <td
                            key={d.getDate()}
                            className="p-1 border-r border-slate-100 bg-emerald-50/30 text-center text-emerald-800 text-[10px]"
                          >
                            <div className="w-1 h-1 bg-emerald-400 rounded-full mx-auto opacity-50"></div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 bg-slate-200 p-1.5 rounded-xl border border-slate-300">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayHeader) => (
                <div key={dayHeader} className="bg-slate-800 text-slate-200 font-bold text-center py-2 text-xs rounded">
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
                  <div key={dayStr} className="bg-white p-2 min-h-[90px] rounded border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>{d.getDate()}</span>
                      {dayAffectations.length > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-extrabold">
                          {dayAffectations.length} occ.
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 my-1 overflow-hidden max-h-[50px]">
                      {dayAffectations.slice(0, 2).map((aff) => (
                        <div
                          key={aff.id}
                          onClick={() => onSelectAffectation(aff)}
                          className="text-[9px] bg-rose-50 border border-rose-200 text-rose-900 p-1 rounded font-medium truncate cursor-pointer hover:bg-rose-100"
                        >
                          {aff.emissionNom}
                        </div>
                      ))}
                      {dayAffectations.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-semibold text-center">
                          +{dayAffectations.length - 2} autres...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modeVue === 'periode' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-emerald-400" />
                Analyse de la Période du {periodStart} au {periodEnd}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Période de {customPeriodDays.length} jour(s) sélectionné(s)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">Ressources Filtre</div>
                <div className="text-emerald-400 font-bold text-sm">{filteredRessources.length}</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">Affectations Totales</div>
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

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-800 text-slate-200 text-xs font-semibold">
                  <th className="py-2.5 px-3 border-b border-slate-700 w-52 sticky left-0 bg-slate-800 z-10">
                    Ressource Humaine
                  </th>
                  {customPeriodDays.map((d) => (
                    <th
                      key={formatDateStr(d)}
                      className="py-2 px-1 border-b border-slate-700 text-center font-mono text-[10px] w-12"
                    >
                      <div className="capitalize">{d.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</div>
                      <div className="text-[9px] text-slate-300">{d.getDate()}/{d.getMonth() + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRessources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-xs">
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-left font-bold hover:text-emerald-600 transition-colors block text-xs"
                      >
                        {res.prenom} {res.nom}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">{res.fonction}</span>
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
                            className="p-1 border-r border-slate-100 bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer text-white text-center text-[10px] font-bold"
                            title={`${matchingAff.emissionNom} (${matchingAff.lieu})`}
                          >
                            <div className="truncate text-[9px]">{matchingAff.emissionNom.slice(0, 5)}</div>
                          </td>
                        );
                      }

                      return (
                        <td key={dayStr} className="p-1 border-r border-slate-100 bg-emerald-50/30 text-center text-emerald-800 text-[10px]">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto opacity-40"></div>
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
