import React from 'react';
import { Search, Calendar, Clock, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { FiltresRecherche } from '../types';
import { CHAINES_LIST, DIRECTIONS_LIST, FONCTIONS_LIST } from '../data/constants';
import { SearchableSelect } from './SearchableSelect';
import { getNowDateTimeStr } from '../../shared/utils/dateHelpers';

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
    <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-4 md:p-6 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.07] gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-lime" />
          <h2 className="text-[13px] font-semibold text-[#dfe9e8] tracking-tight">
            Critères de recherche de disponibilité RH
          </h2>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-[10px] text-[#6e7c84] flex items-center gap-1 font-medium whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-lime" /> Raccourcis :
          </span>
          <button
            type="button"
            onClick={() =>
              onApplyPreset({
                fonction: 'Cameraman',
                chaine: 'Al Aoula',
                dateDebut: getNowDateTimeStr(9, 0),
                dateFin: getNowDateTimeStr(14, 0),
                etat: 'Disponible',
              })
            }
            className="text-[10px] font-medium bg-white/[0.04] hover:bg-lime/10 hover:text-lime text-[#8b98a0] px-3 py-1 rounded-full border border-white/[0.08] hover:border-lime/25 transition-colors whitespace-nowrap"
          >
            Cameramen Al Aoula (aujourd'hui 09h-14h)
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
            className="text-[10px] font-medium bg-white/[0.04] hover:bg-lime/10 hover:text-lime text-[#8b98a0] px-3 py-1 rounded-full border border-white/[0.08] hover:border-lime/25 transition-colors whitespace-nowrap"
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
            className="text-[10px] font-medium bg-white/[0.04] hover:bg-lime/10 hover:text-lime text-[#8b98a0] px-3 py-1 rounded-full border border-white/[0.08] hover:border-lime/25 transition-colors whitespace-nowrap"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.025] p-3.5 rounded-lg border border-white/[0.07]">
          <div>
            <label className="block text-[10px] font-semibold text-[#8b98a0] mb-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-lime" />
              <span>Date et heure de début <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="datetime-local"
              value={filtres.dateDebut}
              onChange={(e) => handleChange('dateDebut', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.09] rounded-lg px-3 py-2 text-xs text-[#eef3f4] font-medium focus:outline-none focus:ring-2 focus:ring-lime/20 focus:border-lime/40 [color-scheme:dark]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#8b98a0] mb-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-lime" />
              <span>Date et heure de fin <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="datetime-local"
              value={filtres.dateFin}
              onChange={(e) => handleChange('dateFin', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.09] rounded-lg px-3 py-2 text-xs text-[#eef3f4] font-medium focus:outline-none focus:ring-2 focus:ring-lime/20 focus:border-lime/40 [color-scheme:dark]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-[#6e7c84] mb-1">
              Chaîne
            </label>
            <select
              value={filtres.chaine}
              onChange={(e) => handleChange('chaine', e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.09] rounded-lg px-3 py-2 text-xs text-[#eef3f4] focus:outline-none focus:ring-2 focus:ring-lime/20"
            >
              {CHAINES_LIST.map((chaine) => (
                <option key={chaine} value={chaine} className="bg-[#0d1217]">
                  {chaine}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#6e7c84] mb-1">
              Direction de rattachement
            </label>
            <SearchableSelect
              options={DIRECTIONS_LIST}
              value={filtres.direction}
              onChange={(val) => handleChange('direction', val)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#6e7c84] mb-1">
              Fonction
            </label>
            <SearchableSelect
              options={FONCTIONS_LIST}
              value={filtres.fonction}
              onChange={(val) => handleChange('fonction', val)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#6e7c84] mb-1">
              Nom, prénom ou matricule
            </label>
            <div className="relative">
              <input
                type="text"
                value={filtres.nomRecherche}
                onChange={(e) => handleChange('nomRecherche', e.target.value)}
                placeholder="Ex: Amrani, Youssef, SNRT..."
                className="w-full bg-white/[0.03] border border-white/[0.09] rounded-lg pl-8 pr-3 py-2 text-xs text-[#eef3f4] focus:outline-none focus:ring-2 focus:ring-lime/20 placeholder:text-[#4f5c64]"
              />
              <Search className="w-3.5 h-3.5 text-[#5f6d75] absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-semibold text-[#8b98a0] mr-1">État :</span>
            <div className="inline-flex bg-white/[0.03] p-1 rounded-full border border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleChange('etat', 'Tous')}
                className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
                  filtres.etat === 'Tous'
                    ? 'bg-white/[0.09] text-[#eef3f4] font-semibold'
                    : 'text-[#6e7c84] hover:text-[#c1cdcf]'
                }`}
              >
                Tous ({totalResultats})
              </button>
              <button
                type="button"
                onClick={() => handleChange('etat', 'Disponible')}
                className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
                  filtres.etat === 'Disponible'
                    ? 'bg-lime text-[#0a1109] font-semibold'
                    : 'text-lime/80 hover:bg-lime/10'
                }`}
              >
                Disponible ({nbDisponibles})
              </button>
              <button
                type="button"
                onClick={() => handleChange('etat', 'Occupée')}
                className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all ${
                  filtres.etat === 'Occupée'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'text-rose-400 hover:bg-rose-500/10'
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
              className="inline-flex items-center space-x-1 px-4 py-2 text-[11px] font-medium text-[#8b98a0] bg-white/[0.04] hover:bg-white/[0.07] rounded-full border border-white/[0.08] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2 text-[11px] font-bold text-[#0a1109] bg-lime hover:bg-[#c4ff69] shadow-[0_0_18px_rgba(183,255,74,0.12)] hover:shadow-[0_0_26px_rgba(183,255,74,0.22)] rounded-full transition-all"
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