import React, { useMemo } from 'react';
import { StatsGlobales, FiltresRecherche } from '../types';
import { getNowDateTimeStr } from '../../shared/utils/dateHelpers';
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
} from 'lucide-react';

interface DashboardProps {
  stats: StatsGlobales | null;
  filtres: FiltresRecherche;
  onNavigateToRecherche: (filtresPreset?: Partial<FiltresRecherche>) => void;
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
      .slice(0, 5);
  }, [stats]);

  const nodePositions = ['node-top', 'node-left', 'node-right', 'node-bottom-left', 'node-bottom-right'];
  const nodeTones: Array<'lime' | 'cyan'> = ['lime', 'cyan', 'lime', 'cyan', 'cyan'];

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

            {topChaines.map(([chaineName, count], i) => (
              <button
                key={chaineName}
                className={`org-node ${nodePositions[i]} node-${nodeTones[i]}`}
                onClick={() => onNavigateToRecherche({ chaine: chaineName })}
              >
                <span className="node-pulse" />
                <span className="node-core" />
                <span className="flex flex-col gap-0.5">
                  <strong className="text-[10px] font-semibold">{chaineName}</strong>
                  <small className="text-[8px] text-[#6e8186] whitespace-nowrap">{count} ressource(s)</small>
                </span>
              </button>
            ))}

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
    </div>
  );
};