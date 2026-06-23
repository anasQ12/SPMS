import { supabase } from './supabaseClient';
import type { AppUser, UserRole } from '../types';

async function attachRoles(users: Record<string, unknown>[]): Promise<AppUser[]> {
  if (users.length === 0) return [];

  const userIds = users.map(u => u.id as string);
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role_id')
    .in('user_id', userIds);

  const roleIds = [...new Set((userRoles || []).map(ur => ur.role_id))];
  let roleNames: Record<string, string> = {};

  if (roleIds.length > 0) {
    const { data: rolesData } = await supabase
      .from('roles')
      .select('id, name')
      .in('id', roleIds);
    for (const r of (rolesData || [])) {
      roleNames[r.id] = r.name;
    }
  }

  const roleMap: Record<string, UserRole[]> = {};
  for (const ur of (userRoles || [])) {
    if (!roleMap[ur.user_id]) roleMap[ur.user_id] = [];
    if (roleNames[ur.role_id]) {
      roleMap[ur.user_id].push(roleNames[ur.role_id] as UserRole);
    }
  }

  return users.map(u => ({
    ...u,
    roles: roleMap[u.id as string] || [],
    is_active: u.status === 'active',
  })) as AppUser[];
}

export const userService = {
  async getAll(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return attachRoles((data || []) as Record<string, unknown>[]);
  },

  async getById(id: string): Promise<AppUser> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    const result = await attachRoles([data as Record<string, unknown>]);
    return result[0];
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
