import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name?: string;
  role: UserRole;
  mustChangePassword: boolean;
  accessToken: string;
  refreshToken?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: AuthUser) => void;
  markPasswordChanged: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'hrms:auth:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      mustChangePassword: false,
      accessToken: '',
      ...parsed,
    } as AuthUser;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('access_token', user.accessToken || '');
      if (user.refreshToken) {
        localStorage.setItem('refresh_token', user.refreshToken);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, [user]);

  const login = (payload: AuthUser) => {
    setUser(payload);
  };

  const logout = () => {
    setUser(null);
  };

  const markPasswordChanged = () => {
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : prev));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      markPasswordChanged,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
