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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#0d1217] rounded-2xl border border-white/[0.09] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-black/30 text-white p-5 flex items-center justify-between border-b border-white/[0.07]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-lime/10 text-lime border border-lime/25">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2 tracking-tight">
                Paramétrage des Fonctions Affichées
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lime/10 text-lime border border-lime/30">
                  {draftSelected.length} / {availableFonctions.length} actives
                </span>
              </h3>
              <p className="text-xs text-[#8b98a0]">
                Sélectionnez les métiers/fonctions RH à inclure dans les plannings et recherches
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le paramétrage des fonctions"
            className="p-1.5 text-[#8b98a0] hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-white/[0.025] p-3 rounded-xl border border-white/[0.07] space-y-2">
            <span className="text-xs font-bold text-[#8b98a0] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-lime" /> Presets Rapides :
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-xs font-medium bg-white/[0.04] hover:bg-lime/10 hover:text-lime text-[#8b98a0] border border-white/[0.08] hover:border-lime/25 rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-lime" /> Tout sélectionner
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-xs font-medium bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-400 text-[#8b98a0] border border-white/[0.08] hover:border-rose-500/25 rounded-lg transition-colors flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5 text-rose-400" /> Tout désélectionner
              </button>
              <button
                type="button"
                onClick={handleSelectTechnique}
                className="px-2.5 py-1 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#8b98a0] border border-white/[0.08] rounded-lg transition-colors"
              >
                🎥 Équipe Technique
              </button>
              <button
                type="button"
                onClick={handleSelectEditorial}
                className="px-2.5 py-1 text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#8b98a0] border border-white/[0.08] rounded-lg transition-colors"
              >
                🎬 Équipe Réalisation
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5f6d75]" />
            <input
              type="text"
              placeholder="Rechercher une fonction (ex: Cameraman, Scripte...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-lg text-[#eef3f4] focus:outline-none focus:ring-2 focus:ring-lime/20 focus:border-lime/40 placeholder:text-[#4f5c64]"
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
                      ? 'bg-lime/[0.06] border-lime/30 text-[#eef3f4]'
                      : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] text-[#6e7c84]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-lime border-lime text-[#0a1109]' : 'bg-white/[0.03] border-white/[0.15]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isChecked ? 'text-[#eef3f4]' : 'text-[#8b98a0]'}`}>
                        {fName}
                      </div>
                      <div className="text-[10px] text-[#6e7c84] flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#5f6d75]" />
                        {count} agent(s) rattaché(s)
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isChecked ? 'bg-lime/15 text-lime border border-lime/30' : 'bg-white/[0.04] text-[#5f6d75]'
                    }`}
                  >
                    {isChecked ? 'Affiché' : 'Masqué'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-black/20 border-t border-white/[0.07] p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-[#8b98a0] hover:text-[#eef3f4] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8b98a0] bg-white/[0.04] border border-white/[0.08] rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-[#0a1109] bg-lime hover:bg-[#c4ff69] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Appliquer le paramétrage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};