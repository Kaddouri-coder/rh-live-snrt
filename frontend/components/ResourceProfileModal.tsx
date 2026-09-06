import React from 'react';
import { RessourceHumaine, Affectation } from '../types';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  Tv,
  Award,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';

interface ResourceProfileModalProps {
  ressource: RessourceHumaine | null;
  affectations: Affectation[];
  onClose: () => void;
  onSelectAffectation: (aff: Affectation) => void;
}

export const ResourceProfileModal: React.FC<ResourceProfileModalProps> = ({
  ressource,
  affectations,
  onClose,
  onSelectAffectation,
}) => {
  if (!ressource) return null;

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1217] rounded-2xl border border-white/[0.09] shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-black/30 text-white p-6 relative border-b border-white/[0.07]">
          <button
            onClick={onClose}
            aria-label="Fermer la fiche ressource"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#8b98a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lime to-cyan font-bold text-xl flex items-center justify-center text-[#0a1109] shadow-md border-2 border-white/[0.08]">
              {ressource.prenom[0]}
              {ressource.nom[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-[#eef3f4] tracking-tight">
                  {ressource.prenom} {ressource.nom}
                </h2>
                <span className="bg-lime/15 text-lime border border-lime/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Fiche Ressource 
                </span>
              </div>
              <p className="text-xs text-[#8b98a0] mt-1 flex items-center gap-2">
                <span className="font-mono bg-white/[0.06] px-2 py-0.5 rounded text-lime font-semibold">
                  Matricule: {ressource.matricule}
                </span>
                <span>•</span>
                <span className="font-semibold text-[#eef3f4]">{ressource.fonction}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.025] p-4 rounded-xl border border-white/[0.07]">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#8b98a0]">
                <Mail className="w-4 h-4 text-lime" />
                <span className="font-medium text-[#eef3f4]">{ressource.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#8b98a0]">
                <Phone className="w-4 h-4 text-lime" />
                <span className="font-medium text-[#eef3f4]">{ressource.telephone}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#8b98a0]">
                <Tv className="w-4 h-4 text-lime" />
                <span>Chaîne : <strong className="text-[#eef3f4]">{ressource.chaineRattachement}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-[#8b98a0]">
                <Briefcase className="w-4 h-4 text-lime" />
                <span>Direction : <strong className="text-[#eef3f4]">{ressource.direction}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#eef3f4] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-lime" />
              Compétences & Habilitations Techniques
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ressource.competences.map((comp) => (
                <span
                  key={comp}
                  className="bg-lime/10 text-lime text-xs font-semibold px-2.5 py-1 rounded-md border border-lime/25"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#eef3f4] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-lime" />
              Historique des affectations ({affectations.length})
            </h3>

            {affectations.length === 0 ? (
              <p className="text-xs text-[#6e7c84] italic bg-white/[0.025] p-3 rounded-lg border border-white/[0.07]">
                Aucune affectation enregistrée pour le moment.
              </p>
            ) : (
              <div className="space-y-2.5">
                {affectations.map((aff) => (
                  <div
                    key={aff.id}
                    onClick={() => onSelectAffectation(aff)}
                    className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#eef3f4] group-hover:text-lime transition-colors">
                        {aff.emissionNom}
                      </span>
                      <span className="bg-white/[0.05] text-[#8b98a0] text-[10px] font-semibold px-2 py-0.5 rounded border border-white/[0.07]">
                        {aff.chaine}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6e7c84] flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 font-medium text-[#8b98a0]">
                        <Clock className="w-3 h-3 text-lime" />
                        {formatDate(aff.dateDebut)} - {formatDate(aff.dateFin)}
                      </span>
                      <span className="flex items-center gap-1 text-[#6e7c84]">
                        <MapPin className="w-3 h-3 text-[#5f6d75]" />
                        {aff.lieu}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/20 p-4 border-t border-white/[0.07] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-[#eef3f4] text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};