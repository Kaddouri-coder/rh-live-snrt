import React from 'react';
import { Affectation, RessourceHumaine } from '../types';
import { X, Tv, Clock, MapPin } from 'lucide-react';

interface AssignmentDetailsModalProps {
  affectation: Affectation | null;
  ressource: RessourceHumaine | null;
  onClose: () => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  affectation,
  ressource,
  onClose,
}) => {
  if (!affectation) return null;

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-rose-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-950/60 hover:bg-rose-950 text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-rose-800 text-rose-200 border border-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Affectation mPlanner V2
            </span>
            <span className="text-xs text-rose-300 font-mono">
              #{affectation.codeEmission || affectation.id}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white mt-1">
            {affectation.emissionNom}
          </h2>
          <p className="text-xs text-rose-200 mt-0.5">
            Type de production : <strong className="text-white">{affectation.typeProduction}</strong>
          </p>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {ressource && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Ressource affectée</p>
                <p className="font-bold text-slate-900 text-sm">
                  {ressource.prenom} {ressource.nom}
                </p>
                <p className="text-xs text-emerald-700 font-semibold">{ressource.fonction}</p>
              </div>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                {ressource.matricule}
              </span>
            </div>
          )}

          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-2 text-slate-800">
            <div className="flex items-center space-x-2 font-semibold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Plage d'affectation :</span>
            </div>
            <div className="pl-6 space-y-1 text-xs">
              <div>
                Début : <strong className="text-slate-900">{formatDate(affectation.dateDebut)}</strong>
              </div>
              <div>
                Fin : <strong className="text-slate-900">{formatDate(affectation.dateFin)}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-emerald-600" /> Chaîne
              </span>
              <p className="font-bold text-slate-900 mt-1">{affectation.chaine}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Studio / Lieu
              </span>
              <p className="font-bold text-slate-900 mt-1">{affectation.lieu}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};