import { supabase } from './supabaseClient';
import type { WeeklyGoal } from '../types';

const GOAL_SELECT = '*, week:program_week_id(*), student:student_id(*, user:user_id(*))';

export const goalService = {
  async getByStudent(studentId: string): Promise<WeeklyGoal[]> {
    const { data, error } = await supabase
      .from('weekly_goals')
      .select(GOAL_SELECT)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WeeklyGoal[];
  },

  async getByStudentAndWeek(studentId: string, weekId: string): Promise<WeeklyGoal[]> {
    const { data, error } = await supabase
      .from('weekly_goals')
      .select(GOAL_SELECT)
      .eq('student_id', studentId)
      .eq('program_week_id', weekId);
    if (error) throw error;
    return (data || []) as WeeklyGoal[];
  },

  async getPendingApprovals(instructorUserId: string): Promise<WeeklyGoal[]> {
    // Get students assigned to this instructor, then their submitted goals
    const { data: assignments } = await supabase
      .from('student_instructor_assignments')
      .select('student_id')
      .eq('instructor_user_id', instructorUserId)
      .eq('status', 'active');

    const studentIds = (assignments || []).map(a => a.student_id);
    if (studentIds.length === 0) return [];

    const { data, error } = await supabase
      .from('weekly_goals')
      .select(GOAL_SELECT)
      .in('student_id', studentIds)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true });
    if (error) throw error;
    return (data || []) as WeeklyGoal[];
  },

  async create(goal: { student_id: string; program_id: string; program_week_id: string; title: string; description?: string }) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .insert({ ...goal, status: 'draft' })
      .select(GOAL_SELECT)
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async update(id: string, updates: { title?: string; description?: string }) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .update(updates)
      .eq('id', id)
      .select(GOAL_SELECT)
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async submit(id: string) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async approve(id: string) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async reject(id: string, reason: string) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async recommendEdit(id: string, note: string) {
    const { data, error } = await supabase
      .from('weekly_goals')
      .update({ status: 'recommended_for_edit', recommendation_note: note })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WeeklyGoal;
  },

  async delete(id: string) {
    const { error } = await supabase.from('weekly_goals').delete().eq('id', id);
    if (error) throw error;
  },
};
