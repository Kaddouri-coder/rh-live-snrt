import React, { useState } from 'react';
import { RessourceHumaine, Affectation } from '../types';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { CHAINES_LIST } from '../data/constants';
import { SearchableSelect } from './SearchableSelect';

interface AddAssignmentModalProps {
  ressources: RessourceHumaine[];
  preselectedResource: RessourceHumaine | null;
  onClose: () => void;
  onSave: (newAff: Partial<Affectation>) => Promise<{ success: boolean; error?: string }>;
  defaultStart: string;
  defaultEnd: string;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  ressources,
  preselectedResource,
  onClose,
  onSave,
  defaultStart,
  defaultEnd,
}) => {
  const [ressourceId, setRessourceId] = useState<string>(
    preselectedResource ? preselectedResource.id : ressources[0]?.id || ''
  );
  const [emissionNom, setEmissionNom] = useState<string>('Journal Télévisé Direct');
  const [typeProduction, setTypeProduction] = useState<'Direct' | 'Enregistrement' | 'Reportage' | 'Plateau'>('Direct');
  const [chaine, setChaine] = useState<string>(
    preselectedResource ? preselectedResource.chaineRattachement : 'Al Aoula'
  );
  const [lieu, setLieu] = useState<string>('Studio A - Rabat');
  const [dateDebut, setDateDebut] = useState<string>(defaultStart || '2026-08-10T09:00');
  const [dateFin, setDateFin] = useState<string>(defaultEnd || '2026-08-10T14:00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ressourceId || !emissionNom || !dateDebut || !dateFin) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);
    const result = await onSave({
      ressourceId,
      emissionNom,
      typeProduction,
      chaine: chaine === 'Toutes les chaînes' ? 'Al Aoula' : chaine,
      lieu,
      dateDebut: dateDebut.length === 16 ? `${dateDebut}:00` : dateDebut,
      dateFin: dateFin.length === 16 ? `${dateFin}:00` : dateFin,
      statut: 'Confirmé',
    });
    setIsSaving(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Nouvelle affectation mPlanner V2
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Ajouter une planification pour tester immédiatement le calcul de disponibilité
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ressource Humaine <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={ressources.map((r) => ({
                value: r.id,
                label: `${r.prenom} ${r.nom}`,
                details: `${r.fonction} • ${r.chaineRattachement}`,
              }))}
              value={ressourceId}
              onChange={setRessourceId}
              placeholder="Sélectionner une ressource..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nom de l'activité / Émission <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={emissionNom}
                onChange={(e) => setEmissionNom(e.target.value)}
                placeholder="Ex: Direct Botola, JT 20H..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Type de production
              </label>
              <SearchableSelect
                options={['Direct', 'Enregistrement', 'Reportage', 'Plateau']}
                value={typeProduction}
                onChange={(val) => setTypeProduction(val as any)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chaîne / Compte</label>
              <select
                value={chaine}
                onChange={(e) => setChaine(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {CHAINES_LIST.filter((c) => c !== 'Toutes les chaînes').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lieu / Studio</label>
              <input
                type="text"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                placeholder="Ex: Studio A Rabat, Car Régie HD..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Début de l'affectation <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fin de l'affectation <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              {isSaving ? 'Enregistrement...' : "Enregistrer l'affectation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
