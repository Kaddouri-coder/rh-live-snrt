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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0d1217] rounded-2xl border border-white/[0.09] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-rose-950/80 text-white p-5 relative border-b border-rose-500/20">
          <button
            onClick={onClose}
            aria-label="Fermer les détails de l'affectation"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Affectation
            </span>
            <span className="text-xs text-rose-300/80 font-mono">
              #{affectation.codeEmission || affectation.id}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white mt-1">
            {affectation.emissionNom}
          </h2>
          <p className="text-xs text-rose-200/80 mt-0.5">
            Type de production : <strong className="text-white">{affectation.typeProduction}</strong>
          </p>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {ressource && (
            <div className="bg-white/[0.025] p-3 rounded-xl border border-white/[0.07] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#6e7c84] font-medium">Ressource affectée</p>
                <p className="font-bold text-[#eef3f4] text-sm">
                  {ressource.prenom} {ressource.nom}
                </p>
                <p className="text-xs text-lime font-semibold">{ressource.fonction}</p>
              </div>
              <span className="text-[10px] font-mono bg-white/[0.06] text-[#c1cdcf] px-2 py-0.5 rounded">
                {ressource.matricule}
              </span>
            </div>
          )}

          <div className="bg-amber-500/[0.08] p-3.5 rounded-xl border border-amber-500/20 space-y-2 text-[#c1cdcf]">
            <div className="flex items-center space-x-2 font-semibold text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Plage d'affectation :</span>
            </div>
            <div className="pl-6 space-y-1 text-xs">
              <div>
                Début : <strong className="text-[#eef3f4]">{formatDate(affectation.dateDebut)}</strong>
              </div>
              <div>
                Fin : <strong className="text-[#eef3f4]">{formatDate(affectation.dateFin)}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.025] p-3 rounded-lg border border-white/[0.07]">
              <span className="text-[11px] text-[#6e7c84] font-medium flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-lime" /> Chaîne
              </span>
              <p className="font-bold text-[#eef3f4] mt-1">{affectation.chaine}</p>
            </div>

            <div className="bg-white/[0.025] p-3 rounded-lg border border-white/[0.07]">
              <span className="text-[11px] text-[#6e7c84] font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-lime" /> Studio / Lieu
              </span>
              <p className="font-bold text-[#eef3f4] mt-1">{affectation.lieu}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 border-t border-white/[0.07] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-[#eef3f4] text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};