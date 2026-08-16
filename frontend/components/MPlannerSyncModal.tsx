import React from 'react';
import { SyncInfo } from '../types';
import { RefreshCw, CheckCircle, Database, Clock, FileText } from 'lucide-react';

interface MPlannerSyncModalProps {
  syncInfo: SyncInfo;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const MPlannerSyncModal: React.FC<MPlannerSyncModalProps> = ({
  syncInfo,
  onTriggerSync,
  isSyncing,
}) => {
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Intégration & Synchronisation mPlanner V2
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Source Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rôle de consultation des planifications et affectations RH
              </p>
            </div>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisation mPlanner V2...' : 'Forcer la synchronisation'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Dernière synchronisation</span>
            <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {formatDate(syncInfo.derniereSynchro)}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Statut de la connexion</span>
            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {syncInfo.statut} (API HTTPs Secure)
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Ressources synchronisées</span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              {syncInfo.nbRessourcesSync} membres RH
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Affectations en mémoire</span>
            <p className="text-xs font-bold text-slate-900 mt-1">
              {syncInfo.nbAffectationsSync} planifications
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Journal des opérations de synchronisation (Logs)
        </h3>

        <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-300 max-h-80 overflow-y-auto space-y-2 border border-slate-800">
          {syncInfo.logs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 pb-2 border-b border-slate-800/80">
              <span className="text-slate-500 text-[10px] whitespace-nowrap">
                [{formatDate(log.timestamp)}]
              </span>
              <span
                className={`font-semibold text-[11px] ${
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
