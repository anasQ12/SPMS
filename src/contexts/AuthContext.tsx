import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppUser, UserRole } from '../types';
import { authService } from '../services/authService';

const ROLE_PRIORITY: UserRole[] = ['manager', 'super_admin', 'instructor', 'guardian', 'student'];

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  activeRole: null,
  setActiveRole: () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);

  const getHighestRole = (roles: UserRole[]): UserRole | null => {
    for (const role of ROLE_PRIORITY) {
      if (roles.includes(role)) return role;
    }
    return null;
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem('spms_active_role', role);
  };

  const loadUser = async () => {
    try {
      const appUser = await authService.getCurrentUser();
      setUser(appUser);
      if (appUser) {
        const savedRole = localStorage.getItem('spms_active_role') as UserRole | null;
        const defaultRole = savedRole && appUser.roles.includes(savedRole)
          ? savedRole
          : getHighestRole(appUser.roles);
        setActiveRoleState(defaultRole);
      } else {
        setActiveRoleState(null);
        localStorage.removeItem('spms_active_role');
      }
    } catch {
      setUser(null);
      setActiveRoleState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    const { data: listener } = authService.onAuthStateChange((session) => {
      if (session) {
        loadUser();
      } else {
        setUser(null);
        setActiveRoleState(null);
        setLoading(false);
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
    await loadUser();
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setActiveRoleState(null);
    localStorage.removeItem('spms_active_role');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, activeRole, setActiveRole, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
