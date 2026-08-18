import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { generateToken } from '../middleware/authMiddleware';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = await UserModel.findByEmailWithHash(email);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const isValid = await UserModel.verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const { passwordHash, ...publicUser } = user;
  const token = generateToken(publicUser);

  res.json({ token, user: publicUser });
};