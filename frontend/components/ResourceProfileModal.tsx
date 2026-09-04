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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Fermer la fiche ressource"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-xl flex items-center justify-center text-white shadow-md border-2 border-slate-800">
              {ressource.prenom[0]}
              {ressource.nom[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">
                  {ressource.prenom} {ressource.nom}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Fiche Ressource 
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-semibold">
                  Matricule: {ressource.matricule}
                </span>
                <span>•</span>
                <span className="font-semibold text-white">{ressource.fonction}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-slate-900 dark:text-white">{ressource.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-slate-900 dark:text-white">{ressource.telephone}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Chaîne : <strong className="text-slate-900 dark:text-white">{ressource.chaineRattachement}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Direction : <strong className="text-slate-900 dark:text-white">{ressource.direction}</strong></span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Compétences & Habilitations Techniques
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ressource.competences.map((comp) => (
                <span
                  key={comp}
                  className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Historique des affectations ({affectations.length})
            </h3>

            {affectations.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                Aucune affectation enregistrée pour le moment.
              </p>
            ) : (
              <div className="space-y-2.5">
                {affectations.map((aff) => (
                  <div
                    key={aff.id}
                    onClick={() => onSelectAffectation(aff)}
                    className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-2xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {aff.emissionNom}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border dark:border-slate-700">
                        {aff.chaine}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {formatDate(aff.dateDebut)} - {formatDate(aff.dateFin)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {aff.lieu}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};