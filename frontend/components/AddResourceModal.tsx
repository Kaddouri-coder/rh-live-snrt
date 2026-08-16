import React, { useState } from 'react';
import { UserPlus, X, Check, Building2, Tv, Briefcase, Mail, Phone, IdCard } from 'lucide-react';
import { CHAINES_LIST, DIRECTIONS_LIST, FONCTIONS_LIST } from '../data/constants';
import { RessourceHumaine } from '../types';
import { SearchableSelect } from './SearchableSelect';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: Partial<RessourceHumaine>) => Promise<void>;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState(`M${Math.floor(10000 + Math.random() * 90000)}`);
  const [fonction, setFonction] = useState(FONCTIONS_LIST[1] || 'Cameraman');
  const [chaineRattachement, setChaineRattachement] = useState(CHAINES_LIST[1] || 'Al Aoula');
  const [direction, setDirection] = useState(DIRECTIONS_LIST[1] || 'Direction de la Production');
  const [statutContrat, setStatutContrat] = useState<'CDI' | 'Permanent' | 'Pigiste' | 'Intermittent'>('Permanent');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+212 6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      setErrorMsg('Veuillez saisir le nom et le prénom de l\'agent.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        nom: nom.trim(),
        prenom: prenom.trim(),
        matricule: matricule.trim(),
        fonction,
        chaineRattachement,
        direction,
        statutContrat,
        email: email.trim() || `${prenom.toLowerCase().trim()}.${nom.toLowerCase().trim()}@snrt.ma`,
        telephone: telephone.trim() || '+212 661 000000',
        competences: ['Équipement Broadcast', 'mPlanner V2'],
      });
      onClose();
    } catch (err) {
      setErrorMsg('Erreur lors de la création de la ressource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Ajouter une Ressource Humaine</h3>
              <p className="text-xs text-slate-400">Enregistrer un nouvel agent ou technicien dans le référentiel mPlanner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5 text-slate-400" /> Prénom *
              </label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex: Youssef"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Benali"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Matricule SNRT</label>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut Contrat</label>
              <SearchableSelect
                options={['Permanent', 'CDI', 'Pigiste', 'Intermittent']}
                value={statutContrat}
                onChange={(val) => setStatutContrat(val as any)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Fonction / Métier *
            </label>
            <SearchableSelect
              options={FONCTIONS_LIST.filter((f) => f !== 'Toutes les fonctions')}
              value={fonction}
              onChange={setFonction}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-slate-400" /> Chaîne de rattachement
              </label>
              <select
                value={chaineRattachement}
                onChange={(e) => setChaineRattachement(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              >
                {CHAINES_LIST.filter((c) => c !== 'Toutes les chaînes').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Direction
              </label>
              <SearchableSelect
                options={DIRECTIONS_LIST.filter((d) => d !== 'Toutes les directions')}
                value={direction}
                onChange={setDirection}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email professionnel
              </label>
              <input
                type="email"
                placeholder="prenom.nom@snrt.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Téléphone
              </label>
              <input
                type="text"
                placeholder="+212 661 123456"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Enregistrer l'agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
