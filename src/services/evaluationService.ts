import { supabase } from './supabaseClient';
import type { Evaluation, EvaluationCategory } from '../types';

const EVAL_SELECT = '*, scores:evaluation_scores(*, category:category_id(*)), instructor:instructor_user_id(*), week:program_week_id(*)';

export const evaluationService = {
  async getByStudent(studentId: string): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(EVAL_SELECT)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Evaluation[];
  },

  async getById(id: string): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(EVAL_SELECT)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Evaluation;
  },

  async getCategories(programId: string): Promise<EvaluationCategory[]> {
    const { data, error } = await supabase
      .from('evaluation_categories')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('name_en');
    if (error) throw error;
    return (data || []) as EvaluationCategory[];
  },

  async create(evaluation: {
    student_id: string;
    instructor_user_id: string;
    program_id: string;
    program_week_id?: string;
    evaluation_period: 'weekly' | 'monthly' | 'end_program';
    public_comment?: string;
    private_note?: string;
    recommendation?: string;
    visibility?: 'public' | 'private_instructors_admin' | 'admin_only';
    scores?: { category_id: string; score: number }[];
  }): Promise<Evaluation> {
    const { scores, ...evalData } = evaluation;
    const { data: ev, error } = await supabase
      .from('evaluations')
      .insert(evalData)
      .select()
      .single();
    if (error) throw error;

    if (scores && scores.length > 0) {
      const scoreRows = scores.map(s => ({
        evaluation_id: ev.id,
        category_id: s.category_id,
        score: s.score,
      }));
      const { error: scoresError } = await supabase.from('evaluation_scores').insert(scoreRows);
      if (scoresError) throw scoresError;
    }

    return this.getById(ev.id);
  },

  async update(id: string, updates: Partial<Evaluation>) {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Evaluation;
  },

  async createCategory(category: Partial<EvaluationCategory>): Promise<EvaluationCategory> {
    const { data, error } = await supabase.from('evaluation_categories').insert(category).select().single();
    if (error) throw error;
    return data as EvaluationCategory;
  },

  async updateCategory(id: string, updates: Partial<EvaluationCategory>): Promise<EvaluationCategory> {
    const { data, error } = await supabase.from('evaluation_categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as EvaluationCategory;
  },
};
