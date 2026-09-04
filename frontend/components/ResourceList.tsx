import React, { useState } from 'react';
import { DisponibiliteResult, Affectation, RessourceHumaine } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Tv,
  MapPin,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface ResourceListProps {
  resultats: DisponibiliteResult[];
  onSelectResource: (ressource: RessourceHumaine) => void;
  onSelectAffectation: (affectation: Affectation) => void;
  dateHeureDebut: string;
  dateHeureFin: string;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resultats,
  onSelectResource,
  onSelectAffectation,
  dateHeureDebut,
  dateHeureFin,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (resultats.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Aucune ressource trouvée</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
          Aucune ressource ne correspond aux critères de recherche définis. Essayez d'élargir la période ou de réinitialiser les filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 gap-3">
        <div className="text-xs text-slate-700 dark:text-slate-300">
          Affichage de <strong className="text-slate-900 dark:text-white font-bold">{resultats.length}</strong> ressource(s) pour la période du{' '}
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
            {formatDate(dateHeureDebut)}
          </span>{' '}
          au{' '}
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
            {formatDate(dateHeureFin)}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Vue :</span>
          <div className="bg-white dark:bg-slate-800 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-slate-800 dark:bg-slate-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cartes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-800 dark:bg-slate-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tableau
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultats.map(({ ressource, etat, affectationsConflit }) => {
            const isDispo = etat === 'Disponible';
            const isExpanded = expandedId === ressource.id;

            return (
              <div
                key={ressource.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all shadow-sm hover:shadow-md ${
                  isDispo
                    ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                    : 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-11 h-11 rounded-full font-bold text-xs flex items-center justify-center text-white shadow-sm ${
                          isDispo
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                            : 'bg-gradient-to-tr from-rose-600 to-amber-600'
                        }`}
                      >
                        {ressource.prenom[0]}
                        {ressource.nom[0]}
                      </div>
                      <div>
                        <button
                          onClick={() => onSelectResource(ressource)}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm text-left flex items-center group"
                        >
                          <span>
                            {ressource.prenom} {ressource.nom}
                          </span>
                          <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                            {ressource.matricule}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{ressource.fonction}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isDispo ? (
                        <span className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Disponible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Occupée</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] mb-3 border-t border-b border-slate-100 dark:border-slate-800 py-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Tv className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {ressource.chaineRattachement}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {ressource.direction}
                    </span>
                    <span className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {ressource.statutContrat}
                    </span>
                  </div>

                  {!isDispo && affectationsConflit.length > 0 && (
                    <div className="bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          Affectation en conflit ({affectationsConflit.length})
                        </span>
                        <button
                          onClick={() => toggleExpand(ressource.id)}
                          className="text-[11px] text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-semibold flex items-center gap-0.5"
                        >
                          {isExpanded ? 'Masquer' : 'Détails'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {affectationsConflit.slice(0, isExpanded ? affectationsConflit.length : 1).map((aff) => (
                        <div
                          key={aff.id}
                          className="bg-white dark:bg-slate-900 rounded p-2.5 border border-rose-200 dark:border-rose-900/60 mt-1 space-y-1 text-xs"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-900 dark:text-white">{aff.emissionNom}</span>
                            <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                              {aff.typeProduction}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              {formatTimeOnly(aff.dateDebut)} - {formatTimeOnly(aff.dateFin)} ({formatDate(aff.dateDebut).split(' ')[0]})
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              {aff.lieu}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <Tv className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              {aff.chaine}
                            </span>
                          </div>

                          <button
                            onClick={() => onSelectAffectation(aff)}
                            className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Consulter la planification</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => onSelectResource(ressource)}
                      className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium text-xs flex items-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Fiche ressource</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 dark:bg-slate-950 text-slate-200 border-b border-slate-700 dark:border-slate-800">
                  <th className="py-3 px-4 font-semibold">Ressource Humaine</th>
                  <th className="py-3 px-4 font-semibold">Fonction</th>
                  <th className="py-3 px-4 font-semibold">Direction / Chaîne</th>
                  <th className="py-3 px-4 font-semibold">État</th>
                  <th className="py-3 px-4 font-semibold">Occupation & Activité</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resultats.map(({ ressource, etat, affectationsConflit }) => {
                  const isDispo = etat === 'Disponible';
                  const mainAff = affectationsConflit[0];

                  return (
                    <tr
                      key={ressource.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !isDispo ? 'bg-rose-50/20 dark:bg-rose-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ressource.prenom} {ressource.nom}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {ressource.matricule}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {ressource.fonction}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {ressource.chaineRattachement}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{ressource.direction}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isDispo ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Disponible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>Occupée</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isDispo ? (
                          <span className="text-slate-400 dark:text-slate-500 italic">Aucune affectation</span>
                        ) : mainAff ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                              <span>{mainAff.emissionNom}</span>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1 py-0.2 rounded border dark:border-slate-700">
                                {mainAff.chaine}
                              </span>
                            </div>
                            <div className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                              {formatTimeOnly(mainAff.dateDebut)} - {formatTimeOnly(mainAff.dateFin)}{' '}
                              • {mainAff.lieu}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Affectation indéfinie</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectResource(ressource)}
                          className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium text-xs underline"
                        >
                          Fiche
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};