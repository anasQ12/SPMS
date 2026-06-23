import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Edit2, Search } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState, StatusBadge, ConfirmDialog } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { goalService } from '../../services/goalService';
import type { Student, WeeklyGoal } from '../../types';

// ── Students List ─────────────────────────────────────────────────────────────

export function InstructorStudents() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    studentService.getByInstructor(user.id)
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = students.filter((s) =>
    s.user?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">My Students</h1>
          <div className="relative">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              className="input-field ps-9 w-64"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState title="No students found" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-start text-neutral-500 font-medium px-4 py-3">Name</th>
                  <th className="text-start text-neutral-500 font-medium px-4 py-3">Level</th>
                  <th className="text-start text-neutral-500 font-medium px-4 py-3">Status</th>
                  <th className="text-start text-neutral-500 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                          {s.user?.full_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-800">{s.user?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{s.current_level || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={'active'} label={'active'} />
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/instructor/students/${s.id}`} className="btn-secondary text-xs py-1.5">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Goal Approvals ────────────────────────────────────────────────────────────

export function InstructorGoalApprovals() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<(WeeklyGoal & { student: Student })[]>([]);
  const [selected, setSelected] = useState<WeeklyGoal | null>(null);
  const [action, setAction] = useState<'reject' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingReason, setPendingReason] = useState('');

  useEffect(() => {
    if (!user) return;
    goalService.getPendingApprovals(user.id)
      .then((g) => setGoals(g as (WeeklyGoal & { student: Student })[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleApprove = async (id: string) => {
    setSaving(true);
    try {
      await goalService.approve(id);
      setGoals(goals.filter((g) => g.id !== id));
      toast.success('Goal approved');
    } catch {
      toast.error('Failed to approve goal');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    const reason = pendingReason;
    if (!selected) return;
    setSaving(true);
    try {
      await goalService.reject(selected.id, reason);
      setGoals(goals.filter((g) => g.id !== selected.id));
      toast.success('Goal rejected');
    } catch {
      toast.error('Failed to reject goal');
    } finally {
      setSaving(false);
      setSelected(null);
      setAction(null);
      setPendingReason('');
    }
  };

  const handleRecommendEdit = async () => {
    const reason = pendingReason;
    if (!selected) return;
    setSaving(true);
    try {
      await goalService.recommendEdit(selected.id, reason);
      setGoals(goals.filter((g) => g.id !== selected.id));
      toast.success('Edit recommendation sent');
    } catch {
      toast.error('Failed to send recommendation');
    } finally {
      setSaving(false);
      setSelected(null);
      setAction(null);
      setPendingReason('');
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('nav.goalApprovals')}</h1>

        <InfoCard title={`${goals.length} Pending Approvals`}>
          {goals.length === 0 ? (
            <EmptyState title="No pending approvals" description="All student goals have been reviewed." />
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const student = goal.student as unknown as { user: { full_name: string } };
                return (
                  <div key={goal.id} className="border border-neutral-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400 font-medium mb-1">
                          {student?.user?.full_name}
                          {goal.week ? ` • Week ${goal.week.week_number}` : ''}
                        </p>
                        <p className="text-sm text-neutral-800">{goal.title}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(goal.id)}
                          disabled={saving}
                          className="p-2 rounded-lg bg-success-50 text-success-700 hover:bg-success-100 transition"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => { setSelected(goal); setAction('edit'); }}
                          className="p-2 rounded-lg bg-warning-50 text-warning-700 hover:bg-warning-100 transition"
                          title="Recommend Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setSelected(goal); setAction('reject'); }}
                          className="p-2 rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100 transition"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </InfoCard>
      </div>

      <ConfirmDialog
        open={!!selected && action === 'reject'}
        title="Reject Goal"
        message={`Reject: "${selected?.title?.substring(0, 60)}..."`}
        confirmLabel="Reject"
        variant="danger"
        reasonRequired
        onConfirm={handleReject}
        onCancel={() => { setSelected(null); setAction(null); }}
      />
      <ConfirmDialog
        open={!!selected && action === 'edit'}
        title="Recommend Edit"
        message="What changes would you like the student to make?"
        confirmLabel="Send Recommendation"
        reasonRequired
        onConfirm={handleRecommendEdit}
        onCancel={() => { setSelected(null); setAction(null); }}
      />
    </DashboardLayout>
  );
}
