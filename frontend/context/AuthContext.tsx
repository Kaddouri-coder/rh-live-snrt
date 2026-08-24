// "La mémoire du restaurant" de l'analogie : l'information de connexion
// (qui est connecté, avec quel badge/token) est partagée instantanément
// avec tout le personnel (tous les composants), sans avoir à la faire
// passer manuellement de main en main (props) à chaque étage.

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppUser } from '../types';

const TOKEN_KEY = 'mplanner_token';
const USER_KEY = 'mplanner_user';

interface AuthContextValue {
  token: string | null;
  currentUser: AppUser | null;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = (newToken: string, user: AppUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook utilisé par n'importe quel composant pour accéder à l'utilisateur
// connecté et au token, sans avoir besoin de les recevoir en props.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>.');
  }
  return ctx;
}