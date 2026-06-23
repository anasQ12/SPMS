import { supabase } from './supabaseClient';
import type { Notification, AuditLog, PerformanceRecord, Recommendation, FinalEvaluation, Program, ProgramWeek } from '../types';

// ── Notification Service ──────────────────────────────────────────────────────

export const notificationService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Notification[];
  },

  async markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllRead(userId: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
};

// ── Audit Service ─────────────────────────────────────────────────────────────

export const auditService = {
  async getAll({ dateFrom, dateTo, entityType }: { dateFrom?: string; dateTo?: string; entityType?: string } = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*, user:actor_user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');
    if (entityType) query = query.eq('entity_type', entityType);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AuditLog[];
  },
};

// ── Performance Record Service ────────────────────────────────────────────────

export const performanceRecordService = {
  async getPending(): Promise<PerformanceRecord[]> {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*, student:student_id(*, user:user_id(*)), instructor:instructor_user_id(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PerformanceRecord[];
  },

  async getByStudent(studentId: string): Promise<PerformanceRecord[]> {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*, instructor:instructor_user_id(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PerformanceRecord[];
  },

  async getByInstructor(instructorUserId: string): Promise<PerformanceRecord[]> {
    const { data, error } = await supabase
      .from('performance_records')
      .select('*, student:student_id(*, user:user_id(*))')
      .eq('instructor_user_id', instructorUserId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as PerformanceRecord[];
  },

  async create(record: {
    student_id: string;
    instructor_user_id: string;
    program_id: string;
    record_type: string;
    title: string;
    description?: string;
  }): Promise<PerformanceRecord> {
    const { data, error } = await supabase.from('performance_records').insert(record).select().single();
    if (error) throw error;
    return data as PerformanceRecord;
  },

  async approve(id: string) {
    const { error } = await supabase.from('performance_records').update({ status: 'approved' }).eq('id', id);
    if (error) throw error;
  },

  async reject(id: string, reason: string) {
    // Insert approval record which triggers sync via DB trigger
    const { data: record } = await supabase.from('performance_records').select('id').eq('id', id).single();
    if (!record) throw new Error('Record not found');
    // Update status directly and log reason
    const { error } = await supabase.from('performance_records').update({ status: 'rejected' }).eq('id', id);
    if (error) throw error;
    // Log the reason in audit
    await supabase.from('audit_logs').insert({
      action: 'performance_record_rejected',
      entity_type: 'performance_records',
      entity_id: id,
      reason,
    });
  },
};

// ── Recommendation Service ────────────────────────────────────────────────────

export const recommendationService = {
  async getByStudent(studentId: string): Promise<Recommendation[]> {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*, instructor:instructor_user_id(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Recommendation[];
  },

  async create(rec: {
    student_id: string;
    instructor_user_id: string;
    program_id: string;
    program_week_id?: string;
    recommendation_text: string;
    recommendation_type: string;
    visibility?: 'public' | 'private_instructors_admin' | 'admin_only';
  }): Promise<Recommendation> {
    const { data, error } = await supabase.from('recommendations').insert(rec).select().single();
    if (error) throw error;
    return data as Recommendation;
  },
};

// ── Final Evaluation Service ──────────────────────────────────────────────────

export const finalEvaluationService = {
  async getAll(): Promise<FinalEvaluation[]> {
    const { data, error } = await supabase
      .from('final_evaluations')
      .select('*, student:student_id(*, user:user_id(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as FinalEvaluation[];
  },

  async getPending(): Promise<FinalEvaluation[]> {
    const { data, error } = await supabase
      .from('final_evaluations')
      .select('*, student:student_id(*, user:user_id(*))')
      .in('status', ['submitted', 'draft'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as FinalEvaluation[];
  },

  async getByStudent(studentId: string): Promise<FinalEvaluation | null> {
    const { data, error } = await supabase
      .from('final_evaluations')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) return null;
    return data as FinalEvaluation;
  },

  async update(id: string, updates: Partial<FinalEvaluation>): Promise<FinalEvaluation> {
    const { data, error } = await supabase.from('final_evaluations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as FinalEvaluation;
  },

  async approve(id: string, score: number, comment?: string) {
    const { error } = await supabase.from('final_evaluations').update({
      status: 'approved',
      manager_final_score: score,
      final_comments: comment,
      approved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  },

  async override(id: string, score: number, reason: string, comment?: string) {
    const { error } = await supabase.from('final_evaluations').update({
      manager_final_score: score,
      override_reason: reason,
      final_comments: comment,
      status: 'approved',
      approved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  },

  async release(id: string) {
    const { error } = await supabase.from('final_evaluations').update({ status: 'released' }).eq('id', id);
    if (error) throw error;
  },
};

// ── Program Service ───────────────────────────────────────────────────────────

export const programService = {
  async getActive(): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('status', 'active')
      .single();
    if (error) return null;
    const p = data as Program;
    return { ...p, name: p.name_en || p.name_ar };
  },

  async getAll(): Promise<Program[]> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as Program[]).map(p => ({ ...p, name: p.name_en || p.name_ar }));
  },

  async getCurrentWeek(programId: string): Promise<ProgramWeek | null> {
    // "Current" week = the week whose date range includes today
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('program_weeks')
      .select('*')
      .eq('program_id', programId)
      .lte('start_date', today)
      .gte('end_date', today)
      .single();
    if (error) return null;
    return data as ProgramWeek;
  },

  async getWeeks(programId: string): Promise<ProgramWeek[]> {
    const { data, error } = await supabase
      .from('program_weeks')
      .select('*')
      .eq('program_id', programId)
      .order('week_number');
    if (error) throw error;
    return (data || []) as ProgramWeek[];
  },

  async createWeek(week: Partial<ProgramWeek>): Promise<ProgramWeek> {
    const { data, error } = await supabase.from('program_weeks').insert(week).select().single();
    if (error) throw error;
    return data as ProgramWeek;
  },

  async update(id: string, updates: Partial<Program>): Promise<Program> {
    const { data, error } = await supabase.from('programs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Program;
  },
};

// ── Storage Service ───────────────────────────────────────────────────────────

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from('profile-pictures').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('profile-pictures').getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

// ── Dashboard Service ─────────────────────────────────────────────────────────

export const dashboardService = {
  async getStudentStats(studentId: string) {
    const [goals, evaluations, notifications] = await Promise.allSettled([
      supabase.from('weekly_goals').select('status').eq('student_id', studentId),
      supabase.from('evaluations').select('calculated_score').eq('student_id', studentId).order('created_at', { ascending: false }).limit(8),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', studentId).eq('is_read', false),
    ]);
    return {
      goalCount: (goals.status === 'fulfilled' ? goals.value.data?.length : 0) || 0,
      latestScores: (evaluations.status === 'fulfilled' ? evaluations.value.data : []) || [],
      unreadNotifications: (notifications.status === 'fulfilled' ? notifications.value.count : 0) || 0,
    };
  },

  async getInstructorStats(instructorUserId: string) {
    const [assignments, pending] = await Promise.allSettled([
      supabase.from('student_instructor_assignments').select('*', { count: 'exact', head: true }).eq('instructor_user_id', instructorUserId).eq('status', 'active'),
      supabase.from('weekly_goals').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    ]);
    return {
      studentCount: (assignments.status === 'fulfilled' ? assignments.value.count : 0) || 0,
      pendingApprovals: (pending.status === 'fulfilled' ? pending.value.count : 0) || 0,
    };
  },

  async getSuperAdminStats() {
    const [students, instructorRoles, missingGoals] = await Promise.allSettled([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('roles!inner(name)', { count: 'exact', head: true }).eq('roles.name', 'instructor'),
      supabase.from('weekly_goals').select('*', { count: 'exact', head: true }).eq('status', 'missed_submission'),
    ]);
    return {
      totalStudents: (students.status === 'fulfilled' ? students.value.count : 0) || 0,
      totalInstructors: (instructorRoles.status === 'fulfilled' ? instructorRoles.value.count : 0) || 0,
      missingGoals: (missingGoals.status === 'fulfilled' ? missingGoals.value.count : 0) || 0,
      evalCompletionRate: 0,
      currentWeek: 1,
      studentsAtRisk: 0,
      goalCompletionData: [],
      riskData: { safe: 0, warning: 0, risk: 0 },
      progressTrend: [],
      evaluationAverages: [],
      instructorPerformance: [],
    };
  },

  async getManagerStats() {
    const [students, pendingRecords, pendingEvals] = await Promise.allSettled([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('performance_records').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('final_evaluations').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'draft']),
    ]);

    const activeProgram = await programService.getActive();

    return {
      totalStudents: (students.status === 'fulfilled' ? students.value.count : 0) || 0,
      pendingRecords: (pendingRecords.status === 'fulfilled' ? pendingRecords.value.count : 0) || 0,
      pendingFinalEvals: (pendingEvals.status === 'fulfilled' ? pendingEvals.value.count : 0) || 0,
      overallAvg: 0,
      instructorAvg: 0,
      riskCount: 0,
      programName: activeProgram?.name_en || activeProgram?.name_ar || '',
      programTrend: [],
      instructorPerformance: [],
    };
  },
};
