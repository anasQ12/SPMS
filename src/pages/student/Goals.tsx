import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { StatusBadge, InfoCard, EmptyState, LoadingState, ConfirmDialog } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { goalService } from '../../services/goalService';
import type { WeeklyGoal } from '../../types';

const editableStatuses = ['draft', 'rejected', 'recommended_for_edit'];

export default function StudentGoals() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState<WeeklyGoal | null>(null);
  const [newText, setNewText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [currentWeekId, setCurrentWeekId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const student = await studentService.getByUserId(user.id);
        if (!student) return;
        setStudentId(student.id);
        const g = await goalService.getByStudent(student.id);
        setGoals(g);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const currentWeekGoals = goals.filter((g) => g.week !== undefined);
  const canAddGoal = currentWeekGoals.length < 3;

  const handleSave = async () => {
    if (!studentId || !newText.trim()) return;
    setSaving(true);
    try {
      if (editGoal) {
        const updated = await goalService.update(editGoal.id, { title: newText });
        setGoals(goals.map((g) => (g.id === editGoal.id ? { ...g, ...updated } : g)));
        toast.success('Goal updated');
      } else {
        const created = await goalService.create({
          student_id: studentId,
          program_id: programId || '',
          program_week_id: currentWeekId || '',
          title: newText,
        });
        setGoals([created, ...goals]);
        toast.success('Goal created');
      }
      setShowForm(false);
      setEditGoal(null);
      setNewText('');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitGoals = async () => {
    const drafts = currentWeekGoals.filter((g) => g.status === 'draft');
    if (drafts.length === 0) { toast.warning('No draft goals to submit'); return; }
    setSaving(true);
    try {
      await Promise.all(drafts.map((g) => goalService.submit(g.id)));
      const updated = await goalService.getByStudent(studentId!);
      setGoals(updated);
      toast.success('Goals submitted for approval');
    } catch (err: unknown) {
      toast.error('Failed to submit goals');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await goalService.delete(deleteId);
      setGoals(goals.filter((g) => g.id !== deleteId));
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete goal');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{t('goals.title')}</h1>
            <p className="text-sm text-neutral-500 mt-1">{t('goals.maxGoals')}</p>
          </div>
          <div className="flex gap-2">
            {canAddGoal && (
              <button onClick={() => { setShowForm(true); setEditGoal(null); setNewText(''); }} className="btn-primary">
                <Plus size={16} /> {t('goals.add')}
              </button>
            )}
            <button onClick={handleSubmitGoals} disabled={saving} className="btn-secondary">
              <Send size={16} /> {t('goals.submit')}
            </button>
          </div>
        </div>

        {/* Goal form */}
        {showForm && (
          <div className="card p-5 border-primary-200 border-2">
            <h3 className="font-semibold text-neutral-800 mb-3">
              {editGoal ? t('goals.edit') : t('goals.add')}
            </h3>
            <textarea
              className="input-field resize-none mb-3"
              rows={3}
              placeholder="Describe your goal for this week..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setEditGoal(null); }} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving || !newText.trim()} className="btn-primary">{t('common.save')}</button>
            </div>
          </div>
        )}

        {/* Current week */}
        <InfoCard title="Current Week Goals">
          {currentWeekGoals.length === 0 ? (
            <EmptyState
              title="No goals this week"
              description="Add 1–3 goals for the current week."
              action={canAddGoal ? <button onClick={() => setShowForm(true)} className="btn-primary text-sm">{t('goals.add')}</button> : undefined}
            />
          ) : (
            <div className="space-y-3">
              {currentWeekGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => { setEditGoal(goal); setNewText(goal.title); setShowForm(true); }}
                  onDelete={() => setDeleteId(goal.id)}
                  t={t}
                />
              ))}
            </div>
          )}
        </InfoCard>

        {/* Previous goals */}
        {goals.filter((g) => !g.week !== undefined).length > 0 && (
          <InfoCard title="Previous Goals">
            <div className="space-y-3">
              {goals
                .filter((g) => !g.week !== undefined)
                .map((goal) => (
                  <GoalCard key={goal.id} goal={goal} t={t} />
                ))}
            </div>
          </InfoCard>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}

const GoalCard: React.FC<{
  goal: WeeklyGoal;
  onEdit?: () => void;
  onDelete?: () => void;
  t: (key: string) => string;
}> = ({ goal, onEdit, onDelete, t }) => {
  const canEdit = editableStatuses.includes(goal.status);

  return (
    <div className="border border-neutral-100 rounded-xl p-4 hover:border-neutral-200 transition">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-800">{goal.title}</p>
          {goal.rejection_reason && (
            <div className="mt-2 flex gap-1.5 items-start text-xs text-danger-600 bg-danger-50 rounded-lg px-2 py-1.5">
              <XCircle size={12} className="mt-0.5 flex-shrink-0" />
              <span>{goal.rejection_reason}</span>
            </div>
          )}
          {goal.recommendation_note && (
            <div className="mt-2 flex gap-1.5 items-start text-xs text-warning-700 bg-warning-50 rounded-lg px-2 py-1.5">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <span>{goal.recommendation_note}</span>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={goal.status} label={t(`goals.statuses.${goal.status}`)} />
            {goal.week && (
              <span className="text-xs text-neutral-400">Week {goal.week.week_number}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {canEdit && onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition">
              <Edit2 size={14} />
            </button>
          )}
          {canEdit && onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
