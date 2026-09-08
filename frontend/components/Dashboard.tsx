import React, { useEffect, useMemo, useState } from 'react';
import { StatsGlobales, FiltresRecherche, DisponibiliteResult } from '../types';
import { getNowDateTimeStr } from '../../shared/utils/dateHelpers';
import { getChannelStyle } from '../data/channelStyles';
import { ChannelBadge } from './ChannelBadge';
import * as api from '../services/api';
import {
  Users,
  CalendarCheck2,
  TrendingUp,
  AlertTriangle,
  Search,
  Sparkles,
  ArrowRight,
  BriefcaseBusiness,
  Grid2X2,
  Zap,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  stats: StatsGlobales | null;
  filtres: FiltresRecherche;
  onNavigateToRecherche: (filtresPreset?: Partial<FiltresRecherche>) => void;
  onSelectResource?: (ressource: DisponibiliteResult['ressource']) => void;
  dateDebutFormatted: string;
  dateFinFormatted: string;
}

function MetricCard({
  label,
  value,
  note,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  accent: 'lime' | 'cyan' | 'violet' | 'rose';
  icon: typeof Users;
}) {
  const accentColor =
    accent === 'lime' ? '#b7ff4a' : accent === 'cyan' ? '#58d5ff' : accent === 'violet' ? '#a58cff' : '#f16e78';
  const accentClass =
    accent === 'lime' ? 'text-lime border-lime/25 bg-lime/[0.07]'
    : accent === 'cyan' ? 'text-cyan border-cyan/25 bg-cyan/[0.07]'
    : accent === 'violet' ? 'text-violet border-violet/25 bg-violet/[0.07]'
    : 'text-rose-400 border-rose-400/25 bg-rose-400/[0.07]';

  return (
    <article className="relative min-h-[124px] overflow-hidden p-5 rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#121c21]/80 to-[#0a1014]/80">
      <div
        className="pointer-events-none absolute w-32 h-32 rounded-full -right-9 -bottom-16 opacity-25"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 66%)` }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#6e7c84]">{label}</span>
        <span className={`w-6 h-6 grid place-items-center rounded-md border ${accentClass}`}>
          <Icon size={14} strokeWidth={1.8} />
        </span>
      </div>
      <div className="relative mt-3 mb-2.5 font-display text-[26px] font-semibold tracking-tight text-[#ecf2f1]">
        {value}
      </div>
      <div className="relative text-[10px] text-[#66757c]">{note}</div>
    </article>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onNavigateToRecherche,
  onSelectResource,
  dateDebutFormatted,
  dateFinFormatted,
}) => {
  // Top chaînes réelles (issues de stats.parChaine) pour les noeuds du mesh —
  // aucune donnée fictive : si une chaîne n'a aucune ressource, elle n'apparaît
  // simplement pas.
  const topChaines = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.parChaine)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [stats]);

  const nodePositions = [
    'node-top',
    'node-top-right',
    'node-right',
    'node-bottom-right',
    'node-bottom',
    'node-bottom-left',
    'node-left',
    'node-top-left',
  ];

  // "Qui peut être mobilisé maintenant" : vraie vérification de disponibilité
  // à l'instant présent (fenêtre glissante de 2h), via le même endpoint que
  // l'onglet Recherche — aucune donnée inventée.
  const [mobilisables, setMobilisables] = useState<DisponibiliteResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const dansDeuxHeures = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const filtresMaintenant: FiltresRecherche = {
      dateDebut: now.toISOString(),
      dateFin: dansDeuxHeures.toISOString(),
      fonction: 'Toutes les fonctions',
      chaine: 'Toutes les chaînes',
      direction: 'Toutes les directions',
    };

    api
      .checkDisponibilite(filtresMaintenant)
      .then((res) => {
        if (!cancelled) setMobilisables(res);
      })
      .catch(() => {
        if (!cancelled) setMobilisables([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const apercuMobilisables = useMemo(() => {
    if (!mobilisables) return [];
    // "Qui peut être mobilisé" ne doit montrer QUE des ressources réellement
    // disponibles (pas juste les 5 premières de la base, quel que soit leur
    // statut). Échantillon mélangé pour ne pas toujours afficher les mêmes
    // personnes quand il y a plus de 5 disponibles.
    const disponibles = mobilisables.filter((r) => r.etat === 'Disponible');
    const melange = [...disponibles].sort(() => Math.random() - 0.5);
    return melange.slice(0, 5);
  }, [mobilisables]);

  // Disponibilité par chaîne, triée par nombre de ressources (les chaînes les
  // plus importantes en premier). Valeurs 100% réelles (stats.disponibiliteParChaine).
  const chainesDisponibilite = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.parChaine)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([chaine, count]) => ({
        chaine,
        count,
        pct: stats.disponibiliteParChaine[chaine] ?? 0,
      }));
  }, [stats]);

  if (!stats) {
    return (
      <div className="bg-[#0d1217] rounded-xl p-8 border border-white/[0.08] text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime mx-auto mb-2"></div>
        <p className="text-xs text-[#829199]">Chargement des statistiques de disponibilité...</p>
      </div>
    );
  }

  const { totalRessources, totalAffectations, tauxOccupation, conflitsDetectes } = stats;

  return (
    <div className="space-y-5">
      {/* Intro */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-[22px] h-px bg-lime shadow-[0_0_8px_rgba(183,255,74,0.55)]" />
            <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#6e7c84]">
              SNRT · Consultation temps réel
            </span>
          </div>
          <h1 className="font-display max-w-[660px] text-[clamp(1.9rem,3.6vw,3rem)] font-semibold tracking-tight leading-[1.03] text-[#eff5f4]">
            Savoir qui est <em className="text-lime not-italic">disponible, maintenant.</em>
          </h1>
          <p className="max-w-md mt-3 text-[13px] leading-relaxed text-[#829199]">
            RH Live centralise la disponibilité des ressources par chaîne, direction et fonction pour
            accélérer chaque affectation.
          </p>
        </div>

        <div className="flex items-center gap-3 pb-0.5 shrink-0">
          <div className="inline-flex items-center gap-2 h-[34px] px-3 rounded-lg border border-cyan/15 bg-[#0e1c21]/60 text-[9px] text-[#7d8c91]">
            <span className="w-[5px] h-[5px] rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" />
            Période <strong className="text-[#cbd9d7] font-medium">{dateDebutFormatted} → {dateFinFormatted}</strong>
          </div>
          <button
            onClick={() => onNavigateToRecherche()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-lime text-[#0a1109] text-[11px] font-bold shadow-[0_0_22px_rgba(183,255,74,0.08)] hover:bg-[#c4ff69] hover:shadow-[0_0_30px_rgba(183,255,74,0.2)] hover:-translate-y-px transition-all"
          >
            <Search className="w-4 h-4" />
            Consulter les disponibilités
          </button>
        </div>
      </section>

      {/* Métriques réelles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Ressources suivies"
          value={totalRessources}
          note="dans la base SNRT"
          accent="cyan"
          icon={Users}
        />
        <MetricCard
          label="Affectations"
          value={totalAffectations}
          note="planifiées sur la période"
          accent="lime"
          icon={CalendarCheck2}
        />
        <MetricCard
          label="Taux d'occupation"
          value={`${tauxOccupation}%`}
          note="des ressources suivies"
          accent="violet"
          icon={TrendingUp}
        />
        <MetricCard
          label="Conflits détectés"
          value={conflitsDetectes}
          note="chevauchements Art. 3"
          accent="rose"
          icon={AlertTriangle}
        />
      </section>

      {/* Mesh + actions rapides */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.85fr] gap-3.5">
        <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80">
          <div className="flex items-start justify-between gap-4 p-5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.12em] uppercase text-[#6e7c84]">
                Availability mesh
                <span className="inline-flex items-center gap-1.5 text-lime">
                  <span className="w-1 h-1 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" /> Live
                </span>
              </div>
              <h2 className="mt-2 text-[15px] font-medium tracking-tight text-[#dfe9e8]">
                La disponibilité par écosystème SNRT.
              </h2>
            </div>
            <button
              onClick={() => onNavigateToRecherche()}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-white/[0.09] bg-white/[0.02] text-[10px] text-[#8e9da1] hover:text-lime hover:border-lime/30 transition-colors shrink-0"
            >
              <Grid2X2 size={13} /> Explorer
            </button>
          </div>

          <div className="mesh-visual mx-3.5 min-h-[300px] sm:min-h-[340px]">
            <div className="mesh-grid" />
            <div className="mesh-orbit orbit-one" />
            <div className="mesh-orbit orbit-two" />
            <div className="mesh-orbit orbit-three" />
            <div className="mesh-sweep" />

            {topChaines.map(([chaineName, count], i) => {
              const style = getChannelStyle(chaineName);
              return (
                <button
                  key={chaineName}
                  className={`org-node ${nodePositions[i]}`}
                  onClick={() => onNavigateToRecherche({ chaine: chaineName })}
                >
                  {style.logo ? (
                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] p-1 overflow-hidden">
                      <img src={style.logo} alt="" className="w-full h-full object-contain" />
                    </span>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                      style={{ background: style.color }}
                    >
                      {style.initials}
                    </span>
                  )}
                  <span className="flex flex-col gap-0.5">
                    <strong className="text-[10px] font-semibold">{chaineName}</strong>
                    <small className="text-[8px] text-[#6e8186] whitespace-nowrap">{count} ressource(s)</small>
                  </span>
                </button>
              );
            })}

            <div className="mesh-center-label">
              <span className="text-[7px] font-bold tracking-[0.18em] text-[#78919b]">RESSOURCES SUIVIES</span>
              <strong className="font-display my-0.5 text-[2.1rem] sm:text-[2.4rem] font-medium tracking-tight text-[#ecf8f1]" style={{ textShadow: '0 0 22px rgba(183,255,74,0.2)' }}>
                {totalRessources}
              </strong>
              <small className="text-[9px] text-[#72858a]">tous métiers confondus</small>
            </div>
          </div>

          <div className="flex items-center justify-between min-h-[46px] px-5 py-3 text-[9px]">
            <div className="flex flex-wrap gap-3.5">
              <span className="flex items-center gap-1.5 text-[#68777c]">
                <i className="w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_7px_theme(colors.lime)]" /> Chaîne suivie
              </span>
              <span className="flex items-center gap-1.5 text-[#68777c]">
                <i className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_7px_theme(colors.cyan)]" /> Chaîne suivie
              </span>
            </div>
            <span className="text-[#64747b]">
              Cliquez un noeud pour filtrer par <strong className="text-[#9ba9ab] font-medium">chaîne</strong>
            </span>
          </div>
        </div>

        {/* Actions rapides (réelles) */}
        <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-5">
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.12em] uppercase text-[#6e7c84]">
            <Sparkles className="w-3.5 h-3.5 text-lime" /> Accès SNRT
          </div>
          <h2 className="mt-2 mb-4 text-[15px] font-medium tracking-tight text-[#dfe9e8]">
            Quelle ressource <em className="text-lime not-italic">faut-il trouver ?</em>
          </h2>

          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                onNavigateToRecherche({
                  fonction: 'Cameraman',
                  chaine: 'Al Aoula',
                  dateDebut: getNowDateTimeStr(9, 0),
                  dateFin: getNowDateTimeStr(14, 0),
                })
              }
              className="flex items-start gap-2.5 min-h-[60px] p-3 rounded-lg border border-lime/15 bg-lime/[0.03] hover:bg-lime/[0.08] hover:border-lime/30 text-left transition-colors group"
            >
              <Zap className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                <strong className="text-[10px] font-semibold text-[#d9e4e4]">Cameramen Al Aoula</strong>
                <small className="text-[9px] text-[#74848a]">Aujourd'hui, 09h – 14h</small>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#58686f] group-hover:text-lime group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => onNavigateToRecherche({ fonction: 'Réalisateur', chaine: 'Arryadia' })}
              className="flex items-start gap-2.5 min-h-[60px] p-3 rounded-lg border border-cyan/15 bg-cyan/[0.03] hover:bg-cyan/[0.08] hover:border-cyan/30 text-left transition-colors group"
            >
              <BriefcaseBusiness className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
              <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                <strong className="text-[10px] font-semibold text-[#d9e4e4]">Réalisateurs Arryadia</strong>
                <small className="text-[9px] text-[#74848a]">Retransmissions sportives</small>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#58686f] group-hover:text-cyan group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>

            <button
              onClick={() => onNavigateToRecherche({ fonction: 'Ingénieur du son' })}
              className="flex items-start gap-2.5 min-h-[60px] p-3 rounded-lg border border-violet/15 bg-violet/[0.03] hover:bg-violet/[0.08] hover:border-violet/30 text-left transition-colors group"
            >
              <Search className="w-4 h-4 text-violet shrink-0 mt-0.5" />
              <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                <strong className="text-[10px] font-semibold text-[#d9e4e4]">Ingénieurs son disponibles</strong>
                <small className="text-[9px] text-[#74848a]">Enregistrement studio</small>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#58686f] group-hover:text-violet group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Qui peut être mobilisé + Disponibilité par chaîne */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.85fr] gap-3.5">
        <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-5">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.12em] uppercase text-[#6e7c84]">
              <UserCheck className="w-3.5 h-3.5 text-lime" /> Ressources en temps réel
            </div>
            <button
              onClick={() => onNavigateToRecherche()}
              className="inline-flex items-center gap-1 text-[10px] text-[#8e9da1] hover:text-lime transition-colors"
            >
              Voir la liste <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <h2 className="mb-4 text-[15px] font-medium tracking-tight text-[#dfe9e8]">
            Qui peut être mobilisé <em className="text-lime not-italic">là, maintenant ?</em>
          </h2>

          {mobilisables === null ? (
            <div className="py-8 text-center text-xs text-[#6e7c84]">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lime mx-auto mb-2"></div>
              Vérification de la disponibilité en cours…
            </div>
          ) : apercuMobilisables.length === 0 ? (
            <p className="text-xs text-[#6e7c84] italic">Aucune ressource trouvée.</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-wider text-[#5f6d75] border-b border-white/[0.07]">
                    <th className="py-2 px-1 font-bold">Ressource</th>
                    <th className="py-2 px-1 font-bold">Chaîne · Direction</th>
                    <th className="py-2 px-1 font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {apercuMobilisables.map(({ ressource, etat }) => {
                    const initials = `${ressource.prenom.charAt(0)}${ressource.nom.charAt(0)}`.toUpperCase();
                    const isDispo = etat === 'Disponible';
                    return (
                      <tr
                        key={ressource.id}
                        className="hover:bg-white/[0.025] transition-colors cursor-pointer"
                        onClick={() => onSelectResource?.(ressource)}
                      >
                        <td className="py-2.5 px-1">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                isDispo ? 'bg-lime/15 text-lime border border-lime/30' : 'bg-cyan/15 text-cyan border border-cyan/30'
                              }`}
                            >
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#eef3f4] truncate">
                                {ressource.prenom} {ressource.nom}
                              </div>
                              <div className="text-[10px] text-[#6e7c84] truncate">{ressource.fonction}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-[11px]">
                          <div className="font-semibold text-[#c1cdcf]">
                            <ChannelBadge name={ressource.chaineRattachement} />
                          </div>
                          <div className="text-[10px] text-[#6e7c84] truncate max-w-[140px]">{ressource.direction}</div>
                        </td>
                        <td className="py-2.5 px-1">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${
                              isDispo ? 'text-lime' : 'text-cyan'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isDispo ? 'bg-lime' : 'bg-cyan'}`} />
                            {isDispo ? 'Disponible' : 'Affectée'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#101e1e]/70 to-[#090f13]/80 p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-[0.12em] uppercase text-[#6e7c84]">
              Couverture des chaînes
            </div>
            <span className="inline-flex items-center gap-1.5 text-[9px] text-lime">
              <span className="w-1 h-1 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime)]" />
              {chainesDisponibilite.length} suivies
            </span>
          </div>
          <h2 className="mb-4 text-[15px] font-medium tracking-tight text-[#dfe9e8]">
            Disponibilité par chaîne
          </h2>

          <div className="space-y-3">
            {chainesDisponibilite.map(({ chaine, pct }) => (
              <button
                key={chaine}
                onClick={() => onNavigateToRecherche({ chaine })}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium text-[#c1cdcf] group-hover:text-lime transition-colors">
                    <ChannelBadge name={chaine} />
                  </span>
                  <span className="font-semibold text-[#9ba9ab]">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-lime transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07] text-[10px] text-[#6e7c84]">
            <span>Ressources suivies</span>
            <strong className="text-[#c1cdcf]">{totalRessources}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};