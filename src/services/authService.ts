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
      .select('role_id')
      .eq('user_id', profile.id);

    const roleIds = (userRoles || []).map(ur => ur.role_id);
    let roles: UserRole[] = [];

    if (roleIds.length > 0) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('name')
        .in('id', roleIds);
      roles = (roleData || []).map(r => r.name as UserRole);
    }

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
