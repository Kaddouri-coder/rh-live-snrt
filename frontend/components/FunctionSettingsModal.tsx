import React, { useState } from 'react';
import { SlidersHorizontal, Check, X, CheckSquare, Square, Search, Users, Sparkles, RotateCcw } from 'lucide-react';
import { RessourceHumaine } from '../types';

interface FunctionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFonctions: string[];
  onSaveFonctions: (fonctions: string[]) => void;
  ressources?: RessourceHumaine[];
}

export const FunctionSettingsModal: React.FC<FunctionSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedFonctions,
  onSaveFonctions,
  ressources = [],
}) => {
  if (!isOpen) return null;

  const availableFonctions = Array.from(
    new Set(ressources.map((r) => r.fonction).filter(Boolean))
  ).sort();

  const [draftSelected, setDraftSelected] = useState<string[]>(
    selectedFonctions.length === 0 ? availableFonctions : selectedFonctions
  );
  const [searchQuery, setSearchQuery] = useState('');

  const getResourceCountForFonction = (fName: string) => {
    return ressources.filter((r) => r.fonction === fName).length;
  };

  const toggleFonction = (fName: string) => {
    if (draftSelected.includes(fName)) {
      setDraftSelected(draftSelected.filter((item) => item !== fName));
    } else {
      setDraftSelected([...draftSelected, fName]);
    }
  };

  const handleSelectAll = () => {
    setDraftSelected([...availableFonctions]);
  };

  const handleDeselectAll = () => {
    setDraftSelected([]);
  };

  const handleSelectTechnique = () => {
    const tech = ['Cameraman', 'Ingénieur du son', 'Éclairagiste', 'Monteur', 'Truquiste'];
    setDraftSelected(tech.filter((f) => availableFonctions.includes(f)));
  };

  const handleSelectEditorial = () => {
    const edit = ['Réalisateur', 'Scripte', 'Chef de car', 'Journaliste'];
    setDraftSelected(edit.filter((f) => availableFonctions.includes(f)));
  };

  const handleSave = () => {
    onSaveFonctions(draftSelected);
    onClose();
  };

  const filteredList = availableFonctions.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Paramétrage des Fonctions Affichées
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {draftSelected.length} / {availableFonctions.length} actives
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sélectionnez les métiers/fonctions RH à inclure dans les plannings et recherches
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le paramétrage des fonctions"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets Rapides :
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Tout sélectionner
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> Tout désélectionner
              </button>
              <button
                type="button"
                onClick={handleSelectTechnique}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
              >
                🎥 Équipe Technique
              </button>
              <button
                type="button"
                onClick={handleSelectEditorial}
                className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
              >
                🎬 Équipe Réalisation
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher une fonction (ex: Cameraman, Scripte...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredList.map((fName) => {
              const isChecked = draftSelected.includes(fName);
              const count = getResourceCountForFonction(fName);

              return (
                <div
                  key={fName}
                  onClick={() => toggleFonction(fName)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-700 shadow-2xs text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {fName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {count} agent(s) rattaché(s)
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isChecked
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isChecked ? 'Affiché' : 'Masqué'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Appliquer le paramétrage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};