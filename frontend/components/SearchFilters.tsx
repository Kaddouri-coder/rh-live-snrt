import React from 'react';
import { Search, Calendar, Clock, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { FiltresRecherche } from '../types';
import { CHAINES_LIST, DIRECTIONS_LIST, FONCTIONS_LIST } from '../data/constants';
import { SearchableSelect } from './SearchableSelect';

interface SearchFiltersProps {
  filtres: FiltresRecherche;
  onChangeFiltres: (nouveauxFiltres: FiltresRecherche) => void;
  onSearch: () => void;
  onReset: () => void;
  onApplyPreset: (preset: {
    fonction?: string;
    chaine?: string;
    dateDebut?: string;
    dateFin?: string;
    etat?: 'Tous' | 'Disponible' | 'Occupée';
  }) => void;
  totalResultats: number;
  nbDisponibles: number;
  nbOccupees: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filtres,
  onChangeFiltres,
  onSearch,
  onReset,
  onApplyPreset,
  totalResultats,
  nbDisponibles,
  nbOccupees,
}) => {
  const handleChange = (field: keyof FiltresRecherche, value: string) => {
    onChangeFiltres({
      ...filtres,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">
            Critères de recherche de disponibilité RH
          </h2>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Raccourcis :
          </span>
          <button
            type="button"
            onClick={() =>
              onApplyPreset({
                fonction: 'Cameraman',
                chaine: 'Al Aoula',
                dateDebut: '2026-08-10T09:00',
                dateFin: '2026-08-10T14:00',
                etat: 'Disponible',
              })
            }
            className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
          >
            Cameramen Al Aoula (10/08 09h-14h)
          </button>
          <button
            type="button"
            onClick={() =>
              onApplyPreset({
                fonction: 'Réalisateur',
                chaine: 'Toutes les chaînes',
                etat: 'Disponible',
              })
            }
            className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
          >
            Réalisateurs Disponibles
          </button>
          <button
            type="button"
            onClick={() =>
              onApplyPreset({
                chaine: 'Arryadia',
                fonction: 'Toutes les fonctions',
                etat: 'Tous',
              })
            }
            className="text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
          >
            Effectif Arryadia
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Date et heure de début <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="datetime-local"
              value={filtres.dateDebut}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Date et heure de fin <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="datetime-local"
              value={filtres.dateFin}
              onChange={(e) => handleChange('dateFin', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Chaîne
            </label>
            <select
              value={filtres.chaine}
              onChange={(e) => handleChange('chaine', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              {CHAINES_LIST.map((chaine) => (
                <option key={chaine} value={chaine}>
                  {chaine}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Direction de rattachement
            </label>
            <SearchableSelect
              options={DIRECTIONS_LIST}
              value={filtres.direction}
              onChange={(val) => handleChange('direction', val)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Fonction
            </label>
            <SearchableSelect
              options={FONCTIONS_LIST}
              value={filtres.fonction}
              onChange={(val) => handleChange('fonction', val)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nom, prénom ou matricule
            </label>
            <div className="relative">
              <input
                type="text"
                value={filtres.nomRecherche}
                onChange={(e) => handleChange('nomRecherche', e.target.value)}
                placeholder="Ex: Amrani, Youssef, SNRT..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700 mr-1">État :</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleChange('etat', 'Tous')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filtres.etat === 'Tous'
                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous ({totalResultats})
              </button>
              <button
                type="button"
                onClick={() => handleChange('etat', 'Disponible')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filtres.etat === 'Disponible'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Disponible ({nbDisponibles})
              </button>
              <button
                type="button"
                onClick={() => handleChange('etat', 'Occupée')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filtres.etat === 'Occupée'
                    ? 'bg-rose-600 text-white shadow-sm font-semibold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Occupée ({nbOccupees})
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Consulter la disponibilité</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
