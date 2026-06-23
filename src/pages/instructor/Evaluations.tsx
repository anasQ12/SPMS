import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { evaluationService } from '../../services/evaluationService';
import { programService } from '../../services/index';
import type { Student, EvaluationCategory, Program } from '../../types';

export default function InstructorEvaluations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'end_program',
    public_comment: '',
    private_note: '',
    scores: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [s, p] = await Promise.allSettled([
          studentService.getByInstructor(user.id),
          programService.getActive(),
        ]);
        if (s.status === 'fulfilled') setStudents(s.value);
        if (p.status === 'fulfilled' && p.value) {
          setProgram(p.value);
          const cats = await evaluationService.getCategories(p.value.id);
          setCategories(cats);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleTypeChange = async (type: 'weekly' | 'monthly' | 'end_program') => {
    setForm({ ...form, type, scores: {} });
    if (program) {
      const cats = await evaluationService.getCategories(program.id);
      setCategories(cats);
    }
  };

  const handleSave = async () => {
    if (!form.student_id || !user) return;
    setSaving(true);
    try {
      const totalWeight = categories.reduce((s, c) => s + c.weight_percentage, 0);
      const calculated_score = totalWeight > 0
        ? categories.reduce((s, c) => s + (form.scores[c.id] || 0) * (c.weight_percentage / totalWeight), 0)
        : undefined;

      await evaluationService.create({
          student_id: form.student_id,
          instructor_user_id: user.id,
          program_id: program!.id,
          evaluation_period: form.type as 'weekly' | 'monthly' | 'end_program',
          public_comment: form.public_comment,
          private_note: form.private_note,
          scores: categories.map((c) => ({ category_id: c.id, score: form.scores[c.id] || 0 })),
        });
      toast.success('Evaluation saved');
      setShowForm(false);
      setForm({ student_id: '', type: 'weekly', public_comment: '', private_note: '', scores: {} });
    } catch {
      toast.error('Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">{t('evaluations.title')}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> New Evaluation
          </button>
        </div>

        {showForm && (
          <div className="card p-6 border-primary-200 border-2">
            <h3 className="font-semibold text-neutral-800 mb-4">New Evaluation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Student</label>
                <select className="input-field" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Select student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.user?.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={form.type} onChange={(e) => handleTypeChange(e.target.value as 'weekly' | 'monthly' | 'end_program')}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="mb-4">
                <label className="label">Scores</label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-700">{cat.name_en}</p>
                        <p className="text-xs text-neutral-400">Weight: {cat.weight_percentage}%</p>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-16 text-center input-field text-sm"
                        value={form.scores[cat.id] || ''}
                        onChange={(e) => setForm({ ...form, scores: { ...form.scores, [cat.id]: Number(e.target.value) } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="label">{t('evaluations.publicComment')}</label>
                <textarea className="input-field resize-none" rows={2} value={form.public_comment} onChange={(e) => setForm({ ...form, public_comment: e.target.value })} />
              </div>
              <div>
                <label className="label">{t('evaluations.privateNote')}</label>
                <textarea className="input-field resize-none" rows={2} value={form.private_note} onChange={(e) => setForm({ ...form, private_note: e.target.value })} placeholder="Visible to admins only..." />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving || !form.student_id} className="btn-primary">
                {saving ? 'Saving...' : t('evaluations.save')}
              </button>
            </div>
          </div>
        )}

        <InfoCard title="Evaluation History">
          <EmptyState title="No evaluations yet" description="Use the form above to add a new evaluation." />
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
