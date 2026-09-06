import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DisponibiliteResult, FiltresRecherche } from '../types';
import { X, Printer, Radio } from 'lucide-react';

interface ExportReportModalProps {
  resultats: DisponibiliteResult[];
  filtres: FiltresRecherche;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  resultats,
  filtres,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Fermeture avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const dispoCount = resultats.filter((r) => r.etat === 'Disponible').length;
  const occuCount = resultats.filter((r) => r.etat === 'Occupée').length;

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Contenu du rapport, réutilisé à la fois pour l'aperçu écran et pour l'impression.
  const reportContent = (
    <div className="p-4 sm:p-8 space-y-6 text-slate-900 bg-white">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
        <div className="flex items-start gap-4">
          <img src="/logo-snrt-full.png" alt="SNRT" className="h-16 object-contain shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
              RH LIVE - RAPPORT DE DISPONIBILITÉ RH
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Royaume du Maroc • Société Nationale de Radiodiffusion et de Télévision
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono whitespace-nowrap">
          <div>Généré le : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="font-bold text-slate-700 block mb-1">Période recherchée :</span>
          <p className="font-semibold text-slate-900">Du : {formatDate(filtres.dateDebut)}</p>
          <p className="font-semibold text-slate-900">Au : {formatDate(filtres.dateFin)}</p>
        </div>

        <div>
          <span className="font-bold text-slate-700 block mb-1">Filtres appliqués :</span>
          <p>Chaîne : <strong>{filtres.chaine}</strong></p>
          <p>Direction : <strong>{filtres.direction}</strong></p>
          <p>Fonction : <strong>{filtres.fonction}</strong></p>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-xs font-bold border-b border-slate-200 pb-3">
        <span>Total consultés : {resultats.length}</span>
        <span className="text-emerald-700">Disponibles : {dispoCount}</span>
        <span className="text-rose-700">Occupés : {occuCount}</span>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-left text-xs border-collapse border border-slate-300 min-w-[640px] print:min-w-0">
        <thead>
          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
            <th className="py-2 px-3 border-r border-slate-300 font-bold">Matricule</th>
            <th className="py-2 px-3 border-r border-slate-300 font-bold">Nom & Prénom</th>
            <th className="py-2 px-3 border-r border-slate-300 font-bold">Fonction</th>
            <th className="py-2 px-3 border-r border-slate-300 font-bold">Chaîne / Direction</th>
            <th className="py-2 px-3 border-r border-slate-300 font-bold">État</th>
            <th className="py-2 px-3 font-bold">Activité / Affectation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {resultats.map(({ ressource, etat, affectationsConflit }) => {
            const isDispo = etat === 'Disponible';
            const mainAff = affectationsConflit[0];

            return (
              <tr key={ressource.id} className="border-b border-slate-200">
                <td className="py-2 px-3 border-r border-slate-300 font-mono text-[11px]">
                  {ressource.matricule}
                </td>
                <td className="py-2 px-3 border-r border-slate-300 font-bold">
                  {ressource.prenom} {ressource.nom}
                </td>
                <td className="py-2 px-3 border-r border-slate-300">{ressource.fonction}</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {ressource.chaineRattachement} ({ressource.direction})
                </td>
                <td className="py-2 px-3 border-r border-slate-300 font-bold">
                  {isDispo ? (
                    <span className="text-emerald-700">DISPONIBLE</span>
                  ) : (
                    <span className="text-rose-700">OCCUPÉE</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {isDispo ? (
                    <span className="text-slate-400 italic">Libre</span>
                  ) : mainAff ? (
                    <div>
                      <strong>{mainAff.emissionNom}</strong> ({mainAff.lieu})
                    </div>
                  ) : (
                    '--'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <div className="pt-8 text-center text-[10px] text-slate-400 border-t border-slate-200">
        Document généré automatiquement par l'application RH Live.
      </div>
    </div>
  );

  return (
    <>
      {/* Aperçu à l'écran (dans le modal habituel) */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto print:hidden"
        onClick={onClose}
      >
        <div
          className="bg-[#0d1217] rounded-2xl border border-white/[0.09] shadow-2xl max-w-4xl w-full overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-black/40 text-white p-4 flex items-center justify-between border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-lime" />
              <span className="font-semibold text-sm">Aperçu du Rapport de Disponibilité RH</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 bg-lime hover:bg-[#c4ff69] text-[#0a1109] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer / Exporter PDF</span>
              </button>

              <button
                onClick={onClose}
                aria-label="Fermer l'aperçu du rapport"
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#8b98a0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {reportContent}
        </div>
      </div>

      {/* Copie dédiée à l'impression : rendue hors de l'arbre de l'app (portal),
          invisible à l'écran, visible uniquement à l'impression (voir index.css). */}
      {createPortal(
        <div id="printable-report" className="hidden print:block">
          {reportContent}
        </div>,
        document.body
      )}
    </>
  );
};