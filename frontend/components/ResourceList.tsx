import React, { useState } from 'react';
import { DisponibiliteResult, Affectation, RessourceHumaine } from '../types';
import { ChannelBadge } from './ChannelBadge';
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
      <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3 text-[#5f6d75]">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#eef3f4] mb-1">Aucune ressource trouvée</h3>
        <p className="text-xs text-[#829199] max-w-md mx-auto mb-4">
          Aucune ressource ne correspond aux critères de recherche définis. Essayez d'élargir la période ou de réinitialiser les filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-3.5 gap-3">
        <div className="text-xs text-[#c1cdcf]">
          Affichage de <strong className="text-[#eef3f4] font-bold">{resultats.length}</strong> ressource(s) pour la période du{' '}
          <span className="font-semibold text-lime bg-lime/10 px-1.5 py-0.5 rounded border border-lime/25">
            {formatDate(dateHeureDebut)}
          </span>{' '}
          au{' '}
          <span className="font-semibold text-lime bg-lime/10 px-1.5 py-0.5 rounded border border-lime/25">
            {formatDate(dateHeureFin)}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#6e7c84] font-medium">Vue :</span>
          <div className="bg-white/[0.03] p-0.5 rounded-full border border-white/[0.08] flex">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'cards' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
              }`}
            >
              Cartes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-white/[0.09] text-[#eef3f4]' : 'text-[#6e7c84] hover:text-[#c1cdcf]'
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
                className={`rounded-xl border transition-all ${
                  isDispo
                    ? 'border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 hover:border-lime/25'
                    : 'border-rose-500/20 bg-gradient-to-br from-[#1a1013]/80 to-[#090f13]/80 hover:border-rose-500/35'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-11 h-11 rounded-full font-bold text-xs flex items-center justify-center text-white shadow-sm ${
                          isDispo ? 'bg-gradient-to-tr from-lime to-cyan text-[#0a1109]' : 'bg-gradient-to-tr from-rose-600 to-amber-600'
                        }`}
                      >
                        {ressource.prenom[0]}
                        {ressource.nom[0]}
                      </div>
                      <div>
                        <button
                          onClick={() => onSelectResource(ressource)}
                          className="font-bold text-[#eef3f4] hover:text-lime transition-colors text-sm text-left flex items-center group"
                        >
                          <span>
                            {ressource.prenom} {ressource.nom}
                          </span>
                          <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-lime" />
                        </button>
                        <div className="text-xs text-[#6e7c84] flex items-center space-x-2 mt-0.5">
                          <span className="font-mono bg-white/[0.05] text-[#9aa5aa] px-1.5 py-0.2 rounded text-[10px]">
                            {ressource.matricule}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-[#8b98a0]">{ressource.fonction}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isDispo ? (
                        <span className="inline-flex items-center space-x-1.5 bg-lime/10 text-lime border border-lime/30 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disponible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Occupée</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] mb-3 border-t border-b border-white/[0.07] py-2">
                    <span className="bg-white/[0.05] text-[#8b98a0] px-2 py-0.5 rounded font-medium">
                      <ChannelBadge name={ressource.chaineRattachement} />
                    </span>
                    <span className="bg-white/[0.05] text-[#8b98a0] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#5f6d75]" />
                      {ressource.direction}
                    </span>
                    <span className="bg-white/[0.03] text-[#6e7c84] px-2 py-0.5 rounded border border-white/[0.07]">
                      {ressource.statutContrat}
                    </span>
                  </div>

                  {!isDispo && affectationsConflit.length > 0 && (
                    <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          Affectation en conflit ({affectationsConflit.length})
                        </span>
                        <button
                          onClick={() => toggleExpand(ressource.id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
                        >
                          {isExpanded ? 'Masquer' : 'Détails'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {affectationsConflit.slice(0, isExpanded ? affectationsConflit.length : 1).map((aff) => (
                        <div key={aff.id} className="bg-white/[0.03] rounded p-2.5 border border-rose-500/15 mt-1 space-y-1 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[#eef3f4]">{aff.emissionNom}</span>
                            <span className="bg-rose-500/15 text-rose-300 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                              {aff.typeProduction}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#8b98a0] flex flex-wrap gap-x-3 gap-y-1 pt-1">
                            <span className="flex items-center gap-1 text-[#c1cdcf] font-medium">
                              <Clock className="w-3 h-3 text-rose-400" />
                              {formatTimeOnly(aff.dateDebut)} - {formatTimeOnly(aff.dateFin)} ({formatDate(aff.dateDebut).split(' ')[0]})
                            </span>
                            <span className="flex items-center gap-1 text-[#8b98a0]">
                              <MapPin className="w-3 h-3 text-[#5f6d75]" />
                              {aff.lieu}
                            </span>
                            <span className="flex items-center gap-1 text-[#8b98a0]">
                              <ChannelBadge name={aff.chaine} />
                            </span>
                          </div>

                          <button
                            onClick={() => onSelectAffectation(aff)}
                            className="mt-1 text-[11px] text-lime hover:underline font-semibold flex items-center gap-1"
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
                      className="text-[#8b98a0] hover:text-lime font-medium text-xs flex items-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5 text-[#5f6d75]" />
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
        <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/30 text-[#9aa5aa] border-b border-white/[0.08]">
                  <th className="py-3 px-4 font-semibold">Ressource Humaine</th>
                  <th className="py-3 px-4 font-semibold">Fonction</th>
                  <th className="py-3 px-4 font-semibold">Direction / Chaîne</th>
                  <th className="py-3 px-4 font-semibold">État</th>
                  <th className="py-3 px-4 font-semibold">Occupation & Activité</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {resultats.map(({ ressource, etat, affectationsConflit }) => {
                  const isDispo = etat === 'Disponible';
                  const mainAff = affectationsConflit[0];

                  return (
                    <tr
                      key={ressource.id}
                      className={`hover:bg-white/[0.03] transition-colors ${!isDispo ? 'bg-rose-500/[0.03]' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#eef3f4]">
                          {ressource.prenom} {ressource.nom}
                        </div>
                        <div className="text-[11px] text-[#6e7c84] font-mono">{ressource.matricule}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-[#c1cdcf]">{ressource.fonction}</td>

                      <td className="py-3 px-4">
                        <div className="text-[#c1cdcf] font-medium"><ChannelBadge name={ressource.chaineRattachement} /></div>
                        <div className="text-[11px] text-[#6e7c84]">{ressource.direction}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isDispo ? (
                          <span className="inline-flex items-center space-x-1 bg-lime/10 text-lime border border-lime/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Disponible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            <XCircle className="w-3 h-3" />
                            <span>Occupée</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isDispo ? (
                          <span className="text-[#5f6d75] italic">Aucune affectation</span>
                        ) : mainAff ? (
                          <div>
                            <div className="font-semibold text-[#eef3f4] flex items-center space-x-1">
                              <span>{mainAff.emissionNom}</span>
                              <span className="text-[10px] bg-white/[0.05] text-[#8b98a0] px-1 py-0.2 rounded border border-white/[0.07]">
                                {mainAff.chaine}
                              </span>
                            </div>
                            <div className="text-[11px] text-rose-400 font-medium">
                              {formatTimeOnly(mainAff.dateDebut)} - {formatTimeOnly(mainAff.dateFin)} • {mainAff.lieu}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#6e7c84]">Affectation indéfinie</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectResource(ressource)}
                          className="text-[#8b98a0] hover:text-lime font-medium text-xs underline"
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