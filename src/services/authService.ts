import { supabase } from './supabaseClient';
import type { AppUser, UserRole } from '../types';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/SPMS/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AppUser | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    if (error || !profile) return null;

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', profile.id);

    const roles: UserRole[] = ((userRoles || []) as { roles: { name: string } | { name: string }[] | null }[])
      .map(ur => {
        const r = ur.roles;
        if (!r) return null;
        if (Array.isArray(r)) return r[0]?.name as UserRole;
        return r.name as UserRole;
      })
      .filter(Boolean) as UserRole[];

    return {
      ...profile,
      roles,
      is_active: profile.status === 'active',
    } as AppUser;
  },

  onAuthStateChange(callback: (session: unknown) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};
