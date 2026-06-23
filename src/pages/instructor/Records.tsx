import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { performanceRecordService, recommendationService } from '../../services/index';
import type { Student, PerformanceRecordType, VisibilityType } from '../../types';

// ── Performance Records ───────────────────────────────────────────────────────

export function InstructorPerformanceRecords() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    record_type: 'achievement' as PerformanceRecordType,
    title: '',
    description: '',
  });

  useEffect(() => {
    if (!user) return;
    studentService.getByInstructor(user.id)
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!form.student_id || !form.title || !user) return;
    setSaving(true);
    try {
      // Get the student's program_id
      const student = students.find(s => s.id === form.student_id);
      await performanceRecordService.create({
        student_id: form.student_id,
        instructor_user_id: user.id,
        program_id: student?.program_id || '',
        record_type: form.record_type,
        title: form.title,
        description: form.description,
      });
      toast.success('Performance record submitted for approval');
      setShowForm(false);
      setForm({ student_id: '', record_type: 'achievement', title: '', description: '' });
    } catch {
      toast.error('Failed to submit record');
    } finally {
      setSaving(false);
    }
  };

  const recordTypes: PerformanceRecordType[] = [
    'award', 'achievement', 'recognition', 'warning',
    'attendance_issue', 'behavior_issue', 'risk_observation', 'other',
  ];

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">{t('performance.title') || 'Performance Records'}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Record
          </button>
        </div>

        {showForm && (
          <div className="card border-2 border-primary-200">
            <h3 className="font-semibold text-neutral-800 mb-4">New Performance Record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Student</label>
                <select className="input-field" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.user?.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Record Type</label>
                <select className="input-field" value={form.record_type} onChange={e => setForm({ ...form, record_type: e.target.value as PerformanceRecordType })}>
                  {recordTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="label">Title</label>
                <input type="text" className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.student_id || !form.title} className="btn-primary">
                {saving ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        )}

        <InfoCard title="Submitted Records">
          <EmptyState title="No records yet" description="Add performance records for your students." />
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}

// ── Recommendations ───────────────────────────────────────────────────────────

export function InstructorRecommendations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    recommendation_type: 'focus_area',
    recommendation_text: '',
    visibility: 'public' as VisibilityType,
  });

  useEffect(() => {
    if (!user) return;
    studentService.getByInstructor(user.id)
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!form.student_id || !form.recommendation_text || !user) return;
    setSaving(true);
    try {
      const student = students.find(s => s.id === form.student_id);
      await recommendationService.create({
        student_id: form.student_id,
        instructor_user_id: user.id,
        program_id: student?.program_id || '',
        recommendation_text: form.recommendation_text,
        recommendation_type: form.recommendation_type,
        visibility: form.visibility,
      });
      toast.success('Recommendation added');
      setShowForm(false);
      setForm({ student_id: '', recommendation_type: 'focus_area', recommendation_text: '', visibility: 'public' });
    } catch {
      toast.error('Failed to add recommendation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">{t('recommendations.title') || 'Recommendations'}</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Recommendation
          </button>
        </div>

        {showForm && (
          <div className="card border-2 border-primary-200">
            <h3 className="font-semibold text-neutral-800 mb-4">New Recommendation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Student</label>
                <select className="input-field" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.user?.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={form.recommendation_type} onChange={e => setForm({ ...form, recommendation_type: e.target.value })}>
                  {(['focus_area', 'risk_attention', 'award_recommendation', 'improvement_plan'] as const).map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Visibility</label>
                <select className="input-field" value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value as VisibilityType })}>
                  <option value="public">Public</option>
                  <option value="private_instructors_admin">Instructors & Admin</option>
                  <option value="admin_only">Admin Only</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Content</label>
              <textarea className="input-field resize-none" rows={3} value={form.recommendation_text} onChange={e => setForm({ ...form, recommendation_text: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.student_id || !form.recommendation_text} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        <InfoCard title="All Recommendations">
          <EmptyState title="No recommendations yet" description="Add recommendations for your students." />
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
