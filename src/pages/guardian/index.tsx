import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { MetricCard, InfoCard, EmptyState, LoadingState, StatusBadge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { evaluationService } from '../../services/evaluationService';
import type { Student, Evaluation } from '../../types';

// ── Guardian Dashboard ────────────────────────────────────────────────────────

export function GuardianDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const s = await studentService.getByGuardian(user.id);
        setStudents(s);
        if (s.length > 0) {
          const e = await evaluationService.getByStudent(s[0].id);
          setEvaluations(e.slice(0, 5));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Guardian Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitoring {students.length} student(s)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="Linked Students" value={students.length} icon={<GraduationCap size={18} />} />
          <MetricCard title="Latest Evaluations" value={evaluations.length} color="success" />
        </div>

        <InfoCard
          title="Linked Students"
          action={<Link to="/guardian/students" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
        >
          {students.length === 0 ? (
            <EmptyState title="No students linked" description="Contact admin to link student accounts." />
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <Link key={s.id} to={`/guardian/students/${s.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">
                    {s.user?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{s.user?.full_name}</p>
                    <p className="text-xs text-neutral-400">{s.current_level || 'Level not set'}</p>
                  </div>
                  <StatusBadge status={'active'} label={'active'} />
                </Link>
              ))}
            </div>
          )}
        </InfoCard>

        {evaluations.length > 0 && (
          <InfoCard title="Recent Evaluations">
            <div className="space-y-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-center">
                    {ev.calculated_score?.toFixed(0) || '—'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800 capitalize">{ev.evaluation_period} Evaluation</p>
                    <p className="text-xs text-neutral-400">{new Date(ev.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Guardian Students ─────────────────────────────────────────────────────────

export function GuardianStudents() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!user) return;
    studentService.getByGuardian(user.id)
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Students</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {students.length === 0 ? (
            <div className="col-span-2"><EmptyState title="No students linked" /></div>
          ) : (
            students.map((s) => (
              <Link key={s.id} to={`/guardian/students/${s.id}`} className="card p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">
                    {s.user?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800">{s.user?.full_name}</p>
                    <p className="text-xs text-neutral-400">{s.current_level}</p>
                  </div>
                </div>
                <StatusBadge status={'active'} label={'active'} />
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Guardian Student Detail (reuses student evaluations/goals) ────────────────

export function GuardianStudentDetail() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  // In a real app, get studentId from route params
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const s = await studentService.getByGuardian(user.id);
        if (s.length > 0) {
          setStudent(s[0]);
          const e = await evaluationService.getByStudent(s[0].id);
          setEvaluations(e);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;
  if (!student) return <DashboardLayout><EmptyState title="Student not found" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 text-lg font-bold flex items-center justify-center">
            {student.user?.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{student.user?.full_name}</h1>
            <p className="text-sm text-neutral-500">{student.current_level}</p>
          </div>
        </div>

        <InfoCard title="Evaluations">
          {evaluations.length === 0 ? (
            <EmptyState title="No evaluations yet" />
          ) : (
            <div className="space-y-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="border border-neutral-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-800 capitalize">{ev.evaluation_period}</span>
                    {ev.calculated_score != null && (
                      <span className="text-primary-600 font-bold">{ev.calculated_score.toFixed(1)}</span>
                    )}
                  </div>
                  {ev.public_comment && <p className="text-sm text-neutral-600">{ev.public_comment}</p>}
                  <p className="text-xs text-neutral-400 mt-1">{new Date(ev.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
