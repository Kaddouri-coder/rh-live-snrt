import { Response } from 'express';
import { UserModel } from '../models/UserModel';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { broadcast } from '../websocket';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  const users = await UserModel.getAll();
  res.json(users);
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, nom, role, telephone, matricule } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, mot de passe et rôle requis' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error:
        'Mot de passe trop faible : 8 caractères minimum, avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.',
    });
  }
  if (role !== 'admin' && role !== 'consultant') {
    return res.status(400).json({ error: "Le rôle doit être 'admin' ou 'consultant'" });
  }

  const existing = await UserModel.findByEmailWithHash(email);
  if (existing) {
    return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
  }

  const newUser = await UserModel.create({ email, password, nom: nom || email, role, telephone, matricule });
  broadcast('USER_CREATED', { id: newUser.id });
  res.status(201).json(newUser);
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { email, nom, role, telephone, matricule, password } = req.body;

  if (email && !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }
  if (password && !STRONG_PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error:
        'Mot de passe trop faible : 8 caractères minimum, avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.',
    });
  }
  if (role && role !== 'admin' && role !== 'consultant') {
    return res.status(400).json({ error: "Le rôle doit être 'admin' ou 'consultant'" });
  }

  const updated = await UserModel.update(id, { email, nom, role, telephone, matricule, password });
  if (!updated) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  broadcast('USER_UPDATED', { id: updated.id });
  res.json(updated);
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }

  const deleted = await UserModel.delete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  broadcast('USER_DELETED', { id: deleted.id });
  res.json({ message: 'Utilisateur supprimé avec succès', user: deleted });
};