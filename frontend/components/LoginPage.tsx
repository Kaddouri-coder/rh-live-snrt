import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { ArrowRight, AlertTriangle, Eye, EyeOff, Clock, ShieldCheck, Radio } from 'lucide-react';
import * as api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Horloge de studio en direct (signature visuelle liée au métier broadcast)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeString = now.toLocaleTimeString('fr-FR', { hour12: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await api.login(email, password);

      if (!result.ok || !result.token || !result.user) {
        setError(result.error || 'Erreur de connexion');
        return;
      }

      onLoginSuccess(result.token, result.user);
    } catch (err) {
      setError('Impossible de contacter le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles "neumorphism" (relief doux) réutilisés pour la carte, les champs et le bouton.
  const neumoBg = '#E6EAF2';
  const neumoRaised = { boxShadow: '10px 10px 20px #b7bfcc, -10px -10px 20px #ffffff' };
  const neumoInset = { boxShadow: 'inset 6px 6px 12px #b7bfcc, inset -6px -6px 12px #ffffff' };

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Colonne gauche : formulaire (style neumorphism) */}
      <div
        className="flex-[1.4] relative flex items-center justify-center px-8 sm:px-16 py-12"
        style={{ background: neumoBg }}
      >
        {/* Logo fixe en haut a gauche */}
        <div className="absolute top-6 left-4 sm:left-6">
          <img src="/logo-snrt-full.png" alt="SNRT" className="h-24 sm:h-28 object-contain" />
        </div>

        <div className="w-full max-w-xl mt-28">
          {/* Carte "neumorphique" en relief */}
          <div className="rounded-[2rem] p-10 sm:p-14" style={{ background: neumoBg, ...neumoRaised }}>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 text-center">Connexion</h1>
            <p className="text-base text-slate-500 mb-10 text-center">
              Accédez à votre espace de disponibilité RH
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2 pl-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@snrt.ma"
                  className="w-full px-6 py-4 rounded-full text-base text-slate-800 placeholder:text-slate-400 border-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-shadow"
                  style={{ background: neumoBg, ...neumoInset }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2 pl-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 pr-12 rounded-full text-base text-slate-800 placeholder:text-slate-400 border-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-shadow"
                    style={{ background: neumoBg, ...neumoInset }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group flex items-center justify-center gap-2 text-slate-800 text-base font-semibold py-4 rounded-full transition-all duration-150 active:shadow-none disabled:opacity-60 mt-3"
                style={neumoRaised}
                onMouseDown={(e) => (e.currentTarget.style.boxShadow = 'inset 4px 4px 8px #b7bfcc, inset -4px -4px 8px #ffffff')}
                onMouseUp={(e) => (e.currentTarget.style.boxShadow = neumoRaised.boxShadow)}
              >
                <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>

          <div className="h-1.5 w-full flex rounded-full overflow-hidden mt-8">
            <div className="flex-1 bg-blue-700" />
            <div className="flex-1 bg-rose-700" />
            <div className="flex-1 bg-amber-600" />
            <div className="flex-1 bg-emerald-700" />
          </div>
        </div>
      </div>

      {/* Colonne droite : panneau d'accueil (masqué sur mobile) */}
      <div
        className="hidden md:block flex-1 max-w-[30%] relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(155deg, #0B1A2E 0%, #103349 45%, #0F4A47 75%, #0C5C4C 100%)',
        }}
      >
        <div className="absolute w-96 h-96 rounded-full bg-emerald-400/10 blur-[100px] -right-20 -bottom-20 pointer-events-none" />

        <div className="relative">
          <div className="absolute top-0 inset-x-0 px-14 py-12">
            <div className="flex justify-end items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-rose-300 uppercase">En direct</span>
              <span className="text-sm text-white tabular-nums tracking-wider ml-1">{timeString}</span>
              <div className="flex items-end gap-0.5 h-3 ml-1" aria-hidden="true">
                {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                  <span
                    key={i}
                    className="waveform-bar w-0.5 bg-emerald-400/70 rounded-full h-full"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Logo SNRT anime (flottant), en echo au metier broadcast */}
            <div className="flex items-center justify-center h-28 mt-6">
              <img
                src="/logo-snrt-icon.webp"
                alt=""
                className="logo-float w-24 h-24 object-contain opacity-80 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Texte de bienvenue : parfaitement centre dans le panneau */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-14">
          <h2 className="text-3xl font-bold mb-3">Bon retour</h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm">
            Consultez et gérez la disponibilité des ressources humaines audiovisuelles de la SNRT en temps réel.
          </p>

          <div className="flex flex-col items-start gap-2.5 mt-6">
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-base text-emerald-50/90">Disponibilité en temps réel</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-base text-emerald-50/90">Accès sécurisé par rôle</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span className="text-base text-emerald-50/90">Couverture multi-chaînes SNRT</span>
            </div>
          </div>
        </div>

        {/* Pied de page : position fixe en bas */}
        <div className="absolute bottom-0 inset-x-0 px-14 py-12 text-[11px] text-slate-400/70">
          Société Nationale de Radiodiffusion et de Télévision
        </div>
      </div>
    </div>
  );
};