import { supabase } from './supabaseClient';
import type { Student } from '../types';

const STUDENT_SELECT = '*, user:user_id(*)';

export const studentService = {
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Student[];
  },

  async getById(id: string): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Student;
  },

  async getByUserId(userId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as Student;
  },

  async getByInstructor(instructorUserId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('student_instructor_assignments')
      .select(`student:student_id(${STUDENT_SELECT})`)
      .eq('instructor_user_id', instructorUserId)
      .eq('status', 'active');
    if (error) throw error;
    return ((data || []) as { student: unknown }[]).map(d => d.student).filter(Boolean) as Student[];
  },

  async getByGuardian(guardianUserId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('student_guardian_assignments')
      .select(`student:student_id(${STUDENT_SELECT})`)
      .eq('guardian_user_id', guardianUserId)
      .eq('status', 'active');
    if (error) throw error;
    return ((data || []) as { student: unknown }[]).map(d => d.student).filter(Boolean) as Student[];
  },

  async updateProfile(id: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select(STUDENT_SELECT)
      .single();
    if (error) throw error;
    return data as Student;
  },

  async assignInstructor(studentId: string, instructorUserId: string, isPrimary = false) {
    const { error } = await supabase
      .from('student_instructor_assignments')
      .upsert({ student_id: studentId, instructor_user_id: instructorUserId, is_primary: isPrimary, status: 'active' });
    if (error) throw error;
  },

  async assignGuardian(studentId: string, guardianUserId: string) {
    const { error } = await supabase
      .from('student_guardian_assignments')
      .upsert({ student_id: studentId, guardian_user_id: guardianUserId, status: 'active' });
    if (error) throw error;
  },
};
