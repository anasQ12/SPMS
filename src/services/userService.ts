import { supabase } from './supabaseClient';
import type { AppUser, UserRole } from '../types';

export const userService = {
  async getAll(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(roles(name))')
      .order('full_name');
    if (error) throw error;
    return ((data || []) as unknown[]).map((u: unknown) => {
      const user = u as Record<string, unknown>;
      const roles = ((user.user_roles as { roles: { name: string } }[]) || [])
        .map(ur => ur.roles?.name as UserRole)
        .filter(Boolean);
      return { ...user, roles, is_active: user.status === 'active' } as AppUser;
    });
  },

  async getById(id: string): Promise<AppUser> {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(roles(name))')
      .eq('id', id)
      .single();
    if (error) throw error;
    const roles = ((data.user_roles as { roles: { name: string } }[]) || [])
      .map((ur) => ur.roles?.name as UserRole)
      .filter(Boolean);
    return { ...data, roles, is_active: data.status === 'active' } as AppUser;
  },

  async update(id: string, updates: Partial<AppUser>) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as AppUser;
  },

  async updateAvatar(id: string, url: string) {
    const { error } = await supabase.from('users').update({ profile_picture_url: url }).eq('id', id);
    if (error) throw error;
  },

  async suspend(id: string) {
    const { error } = await supabase.from('users').update({ status: 'suspended' }).eq('id', id);
    if (error) throw error;
  },

  async activate(id: string) {
    const { error } = await supabase.from('users').update({ status: 'active' }).eq('id', id);
    if (error) throw error;
  },

  async assignRole(userId: string, roleName: UserRole) {
    const { data: role } = await supabase.from('roles').select('id').eq('name', roleName).single();
    if (!role) throw new Error('Role not found');
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role_id: role.id });
    if (error) throw error;
  },

  async removeRole(userId: string, roleName: UserRole) {
    const { data: role } = await supabase.from('roles').select('id').eq('name', roleName).single();
    if (!role) throw new Error('Role not found');
    const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role_id', role.id);
    if (error) throw error;
  },
};
