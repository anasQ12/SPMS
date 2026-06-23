// ── Core ──────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'instructor' | 'guardian' | 'super_admin' | 'manager';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface AppUser {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture_url?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  // populated client-side from user_roles join
  roles: UserRole[];
  // convenience getter used in UI
  is_active?: boolean;
}

// ── Program ───────────────────────────────────────────────────────────────────

export type ProgramStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Program {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  start_date: string;
  end_date?: string;
  status: ProgramStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // convenience getter
  name?: string;
}

export interface ProgramWeek {
  id: string;
  program_id: string;
  week_number: number;
  week_name_ar?: string;
  week_name_en?: string;
  start_date: string;
  end_date: string;
  created_by?: string;
  created_at: string;
}

// ── Student ───────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  user_id: string;
  program_id: string;
  dob?: string;
  current_level?: string;
  social_status?: string;
  hobbies?: string;
  strengths?: string;
  weaknesses?: string;
  personal_notes?: string;
  created_at: string;
  updated_at: string;
  // joined
  user?: AppUser;
  program?: Program;
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export type GoalStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'recommended_for_edit'
  | 'locked'
  | 'completed'
  | 'carried_over'
  | 'missed_submission';

export interface WeeklyGoal {
  id: string;
  student_id: string;
  program_id: string;
  program_week_id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  is_mandatory: boolean;
  carried_from_goal_id?: string;
  created_by?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  recommendation_note?: string;
  created_at: string;
  updated_at: string;
  // joined
  week?: ProgramWeek;
  student?: Student;
}

// ── Evaluations ───────────────────────────────────────────────────────────────

export type EvaluationPeriod = 'weekly' | 'monthly' | 'end_program';
export type VisibilityType = 'public' | 'private_instructors_admin' | 'admin_only';

export interface EvaluationCategory {
  id: string;
  program_id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  max_score: number;
  weight_percentage: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  student_id: string;
  instructor_user_id: string;
  program_id: string;
  program_week_id?: string;
  evaluation_period: EvaluationPeriod;
  public_comment?: string;
  private_note?: string;
  recommendation?: string;
  visibility: VisibilityType;
  calculated_score?: number;
  submitted_at?: string;
  created_at: string;
  // joined
  scores?: EvaluationScore[];
  instructor?: AppUser;
  week?: ProgramWeek;
}

export interface EvaluationScore {
  id: string;
  evaluation_id: string;
  category_id: string;
  score: number;
  weighted_score?: number;
  category?: EvaluationCategory;
}

// ── Recommendations ───────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;
  student_id: string;
  instructor_user_id: string;
  program_id: string;
  program_week_id?: string;
  recommendation_text: string;
  recommendation_type: string;
  visibility: VisibilityType;
  created_at: string;
  instructor?: AppUser;
}

// ── Performance Records ───────────────────────────────────────────────────────

export type PerformanceRecordType =
  | 'award'
  | 'achievement'
  | 'recognition'
  | 'warning'
  | 'attendance_issue'
  | 'behavior_issue'
  | 'risk_observation'
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PerformanceRecord {
  id: string;
  student_id: string;
  instructor_user_id: string;
  program_id: string;
  record_type: PerformanceRecordType;
  title: string;
  description?: string;
  status: ApprovalStatus;
  created_at: string;
  updated_at: string;
  // joined
  student?: Student;
  instructor?: AppUser;
}

// ── Final Evaluations ─────────────────────────────────────────────────────────

export type FinalStatus = 'draft' | 'submitted' | 'approved' | 'released';

export interface FinalEvaluation {
  id: string;
  student_id: string;
  program_id: string;
  system_calculated_score?: number;
  super_admin_recommended_score?: number;
  manager_final_score?: number;
  override_reason?: string;
  final_comments?: string;
  status: FinalStatus;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // joined
  student?: Student;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'goal_deadline'
  | 'missed_goal'
  | 'evaluation_update'
  | 'approval_needed'
  | 'report_released'
  | 'general';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  reason?: string;
  created_at: string;
  // joined
  user?: AppUser;
}
