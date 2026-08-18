import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { ArrowRight, AlertTriangle, Eye, EyeOff, Clock, ShieldCheck, Radio } from 'lucide-react';

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError('Impossible de contacter le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Colonne gauche : formulaire */}
      <div className="flex-1 relative flex items-center justify-center px-8 sm:px-16 py-12">
        {/* Logo fixe en haut a gauche */}
        <div className="absolute top-8 left-8 sm:left-16">
          <img src="/logo-snrt-full.png" alt="SNRT" className="h-20 sm:h-24 object-contain" />
        </div>

        {/* Nom du produit en haut a droite */}
        <div className="absolute top-10 right-8 sm:right-16">
          <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">mPlanner V2</span>
        </div>

        <div className="w-full max-w-lg">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 mt-1">Connexion</h1>
          <p className="text-base text-slate-500 mb-10">Accédez à votre espace de disponibilité RH</p>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@snrt.ma"
                className="w-full border-b border-slate-300 pb-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-colors bg-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Mot de passe</label>
              <div className="flex items-center border-b border-slate-300 focus-within:border-emerald-600 transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pb-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="pb-3 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 disabled:opacity-60 disabled:hover:bg-slate-900 text-white text-base font-semibold py-3.5 rounded-lg transition-colors duration-200 mt-3"
            >
              <span>{isSubmitting ? 'Connexion...' : 'Se connecter'}</span>
              {!isSubmitting && (
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <div className="h-1.5 w-full flex rounded-full overflow-hidden mt-12">
            <div className="flex-1 bg-blue-700" />
            <div className="flex-1 bg-rose-700" />
            <div className="flex-1 bg-amber-600" />
            <div className="flex-1 bg-emerald-700" />
          </div>
        </div>
      </div>

      {/* Colonne droite : panneau d'accueil (masqué sur mobile) */}
      {/* Colonne droite : panneau d'accueil (masqué sur mobile) */}
      <div
        className="hidden md:block flex-1 relative overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(155deg, #0B1A2E 0%, #103349 45%, #0F4A47 75%, #0C5C4C 100%)',
        }}
      >
        <div className="absolute w-96 h-96 rounded-full bg-emerald-400/10 blur-[100px] -right-20 -bottom-20 pointer-events-none" />

        {/* Zone haute : indicateur "En direct" + logo anime (position fixe en haut) */}
        <div className="absolute top-0 inset-x-0 px-14 py-12">
          <div className="flex justify-end items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-rose-300 uppercase">En direct</span>
            <span className="text-sm text-white tabular-nums tracking-wider ml-1">{timeString}</span>
          </div>

          {/* Logo SNRT anime (flottant), en echo au metier broadcast */}
          <div className="flex items-center justify-center h-40 mt-10">
            <img
              src="/logo-snrt-icon.webp"
              alt=""
              className="logo-float w-36 h-36 object-contain opacity-80 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Texte de bienvenue : parfaitement centre dans le panneau */}
        {/* Texte de bienvenue : parfaitement centre dans le panneau */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-14">
          <h2 className="text-4xl font-bold mb-4">Bon retour</h2>
          <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md">
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