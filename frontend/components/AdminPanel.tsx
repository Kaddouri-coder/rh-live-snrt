import React, { useEffect, useState } from 'react';
import { AppUser } from '../types';
import { X, UserPlus, AlertTriangle, CheckCircle2, ShieldCheck, Users, Pencil, Trash2, XCircle, Search, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isStrongPassword } from '../../shared/utils/validation';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { token, currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [matricule, setMatricule] = useState('');
  const [role, setRole] = useState<'admin' | 'consultant'>('consultant');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = editingUserId !== null;

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditingUserId(null);
    setEmail('');
    setNom('');
    setPassword('');
    setTelephone('');
    setMatricule('');
    setRole('consultant');
  };

  const handleStartEdit = (u: AppUser) => {
    setEditingUserId(u.id);
    setEmail(u.email);
    setNom(u.nom);
    setPassword('');
    setTelephone(u.telephone || '');
    setMatricule(u.matricule || '');
    setRole(u.role);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDelete = async (u: AppUser) => {
    if (u.id === currentUser?.id) return;
    const confirmed = window.confirm(`Supprimer le compte de "${u.nom}" (${u.email}) ? Cette action est irréversible.`);
    if (!confirmed) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erreur lors de la suppression.');
        return;
      }

      setSuccessMsg(`Utilisateur "${u.email}" supprimé.`);
      if (editingUserId === u.id) resetForm();
      await fetchUsers();
    } catch (err) {
      setErrorMsg('Erreur réseau : impossible de contacter le serveur.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || (!isEditing && !password)) {
      setErrorMsg('Email et mot de passe sont obligatoires.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Adresse email invalide (format attendu : prenom.nom@snrt.ma).');
      return;
    }

    if (password && !isStrongPassword(password)) {
      setErrorMsg(
        'Mot de passe trop faible : 8 caractères minimum, avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.'
      );
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `/api/users/${editingUserId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { email, nom: nom || email, role, telephone, matricule };
      if (password) body.password = password;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Erreur lors de l'enregistrement.");
        return;
      }

      setSuccessMsg(
        isEditing
          ? `Utilisateur "${data.email}" mis à jour avec succès.`
          : `Utilisateur "${data.email}" créé avec succès (rôle : ${data.role}).`
      );
      resetForm();
      await fetchUsers();
    } catch (err) {
      setErrorMsg('Erreur réseau : impossible de contacter le serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.matricule || '').toLowerCase().includes(q) ||
      (u.telephone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Administration</h2>
              <p className="text-[11px] text-slate-400">Gestion des comptes utilisateurs</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer l'administration" className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {isEditing ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <XCircle className="w-3.5 h-3.5" />
                Annuler la modification
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@snrt.ma"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Youssef Amrani"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isEditing ? 'Nouveau mot de passe' : 'Mot de passe *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!isEditing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'Laisser vide pour ne pas changer' : '••••••••'}
                  className="w-full px-3 py-2 pr-9 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+212 6XX XXX XXX"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Matricule SNRT</label>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex: MAT1020"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rôle *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'consultant')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="consultant">Consultant</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 rounded-lg p-2.5 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-lg p-2.5 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            {isSaving ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : "Créer l'utilisateur"}
          </button>
        </form>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Utilisateurs ({filteredUsers.length}{searchQuery ? ` / ${users.length}` : ''})
            </h3>
            <div className="relative w-full max-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">Aucun utilisateur ne correspond à la recherche.</p>
            )}
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-xs ${
                  editingUserId === u.id
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{u.nom}</div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                  {(u.telephone || u.matricule) && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {u.matricule && <span>{u.matricule}</span>}
                      {u.matricule && u.telephone && <span> • </span>}
                      {u.telephone && <span>{u.telephone}</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      u.role === 'admin'
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Consultant'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(u)}
                    title="Modifier"
                    className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(u)}
                    disabled={u.id === currentUser?.id}
                    title={u.id === currentUser?.id ? 'Impossible de supprimer votre propre compte' : 'Supprimer'}
                    className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};