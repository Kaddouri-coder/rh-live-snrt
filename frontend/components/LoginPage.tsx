import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { ArrowRight, AlertTriangle, Eye, EyeOff, Clock, ShieldCheck, Radio } from 'lucide-react';
import * as api from '../services/api';
import { SNRTBackground } from './SNRTBackground';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div
      className="h-screen flex flex-col md:flex-row overflow-hidden relative text-[#eef3f4]"
      style={{ background: '#05080b' }}
    >
      <SNRTBackground />

      {/* Colonne gauche : formulaire */}
      <div className="relative z-10 flex-[1.4] flex items-center justify-center px-8 sm:px-16 py-12">
        <div className="absolute top-6 left-4 sm:left-6 opacity-90">
          <img src="/logo-snrt-full.png" alt="SNRT" className="h-16 sm:h-20 object-contain" />
        </div>

        <div className="w-full max-w-lg mt-20">
          <div className="rounded-2xl border border-white/[0.09] bg-[#0a1014]/85 backdrop-blur-md p-9 sm:p-11 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-[18px] h-px bg-lime shadow-[0_0_8px_rgba(183,255,74,0.55)]" />
              <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-[#6e7c84]">
                SNRT · Accès sécurisé
              </span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#eff5f4] mb-2">
              Connexion
            </h1>
            <p className="text-[13px] text-[#829199] mb-8">
              Accédez à votre espace de disponibilité RH
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-[#6e7c84] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@snrt.ma"
                  className="w-full px-4 py-3 rounded-lg text-sm text-[#eef3f4] placeholder:text-[#4f5c64] bg-white/[0.03] border border-white/[0.09] focus:outline-none focus:border-lime/40 focus:ring-2 focus:ring-lime/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wide text-[#6e7c84] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-lg text-sm text-[#eef3f4] placeholder:text-[#4f5c64] bg-white/[0.03] border border-white/[0.09] focus:outline-none focus:border-lime/40 focus:ring-2 focus:ring-lime/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6d75] hover:text-lime transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-lg p-3 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-lime text-[#0a1109] text-sm font-bold shadow-[0_0_22px_rgba(183,255,74,0.1)] hover:bg-[#c4ff69] hover:shadow-[0_0_30px_rgba(183,255,74,0.22)] disabled:opacity-60 disabled:hover:shadow-none transition-all mt-2 group"
              >
                <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>

          <div className="h-1 w-full flex rounded-full overflow-hidden mt-6 opacity-90">
            <div className="flex-1" style={{ background: '#00549e' }} />
            <div className="flex-1" style={{ background: '#d42b35' }} />
            <div className="flex-1" style={{ background: '#de6b07' }} />
            <div className="flex-1" style={{ background: '#00782b' }} />
          </div>
        </div>
      </div>

      {/* Colonne droite : panneau d'accueil (masqué sur mobile) */}
      <div
        className="relative z-10 hidden md:block flex-1 max-w-[32%] overflow-hidden border-l border-white/[0.07]"
        style={{ background: 'linear-gradient(165deg, #060a0d 0%, #0a1519 55%, #0a1613 100%)' }}
      >
        <div className="absolute w-96 h-96 rounded-full bg-lime/[0.06] blur-[110px] -right-20 -bottom-20 pointer-events-none" />

        <div className="absolute top-0 inset-x-0 px-12 py-10">
          <div className="flex justify-end items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-lime uppercase">En direct</span>
            <span className="font-display text-sm text-[#dfe9e8] tabular-nums tracking-wider ml-1">{timeString}</span>
            <div className="flex items-end gap-0.5 h-3 ml-1" aria-hidden="true">
              {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                <span
                  key={i}
                  className="waveform-bar w-0.5 bg-cyan/70 rounded-full h-full"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center h-24 mt-6 [perspective:800px]">
            <img
              src="/logo-snrt-icon.webp"
              alt=""
              className="logo-float w-20 h-20 object-contain opacity-85 drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#eff5f4] mb-3">
            Bon retour
          </h2>
          <p className="text-xs text-[#829199] leading-relaxed max-w-sm">
            Consultez la disponibilité des ressources humaines audiovisuelles de la SNRT, fonction par fonction, en temps réel.
          </p>

          <div className="flex flex-col items-start gap-2.5 mt-7">
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-lime/10 border border-lime/20 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-lime" />
              </div>
              <span className="text-sm text-[#c7d3d2]">Disponibilité en temps réel</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
              </div>
              <span className="text-sm text-[#c7d3d2]">Accès sécurisé par rôle</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-[26px] h-[26px] rounded-md bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5 text-violet" />
              </div>
              <span className="text-sm text-[#c7d3d2]">Couverture multi-chaînes SNRT</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-12 py-10 text-[11px] text-[#5f6d75]">
          Société Nationale de Radiodiffusion et de Télévision
        </div>
      </div>
    </div>
  );
};