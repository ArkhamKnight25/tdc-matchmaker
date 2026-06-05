import { createContext, useContext, useState, type ReactNode } from 'react';
import { MATCHMAKERS } from '../data/auth';
import type { Matchmaker } from '../types';

interface AuthContextType {
  matchmaker: Matchmaker | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'tdc_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [matchmaker, setMatchmaker] = useState<Matchmaker | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const id = JSON.parse(stored);
      return MATCHMAKERS.find((m) => m.id === id) ?? null;
    }
    return null;
  });

  function login(email: string, password: string): boolean {
    const found = MATCHMAKERS.find((m) => m.email === email && m.password === password);
    if (found) {
      setMatchmaker(found);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found.id));
      return true;
    }
    return false;
  }

  function logout() {
    setMatchmaker(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return <AuthContext.Provider value={{ matchmaker, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
