'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, UserPreferences } from '../types/user';
import { dbAdapter } from '../lib/db/mock-adapter';
import { DEFAULT_PLAYER_CONFIG } from '../lib/audio-constants';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (username: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_SESSION: UserSession = {
  id: 'default-user',
  username: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  preferences: {
    favoriteTrackIds: ['track-1', 'track-3'],
    volume: DEFAULT_PLAYER_CONFIG.initialVolume,
    lastTrackId: 'track-1',
    lastPositionSeconds: 0,
    theme: 'dark'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(DEFAULT_SESSION);

  useEffect(() => {
    // Sincronizar preferencias del adaptador
    async function syncPrefs() {
      if (user) {
        const prefs = await dbAdapter.getUserPreferences(user.id);
        setUser((prev) => (prev ? { ...prev, preferences: prefs } : null));
      }
    }
    syncPrefs();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const username = email.split('@')[0] || 'Usuario';
    const prefs = await dbAdapter.getUserPreferences('default-user');
    const session: UserSession = {
      id: 'default-user',
      username: username.charAt(0).toUpperCase() + username.slice(1),
      email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      preferences: prefs
    };
    setUser(session);
    return true;
  };

  const register = async (username: string, email: string): Promise<boolean> => {
    const prefs = await dbAdapter.getUserPreferences('default-user');
    const session: UserSession = {
      id: `user-${Date.now()}`,
      username,
      email,
      preferences: prefs
    };
    setUser(session);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updatePreferences = async (partialPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    await dbAdapter.updateUserPreferences(user.id, partialPrefs);
    const updated = await dbAdapter.getUserPreferences(user.id);
    setUser((prev) => (prev ? { ...prev, preferences: updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
