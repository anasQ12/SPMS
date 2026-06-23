import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, FileCheck, ClipboardList, AlertTriangle, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { MetricCard, InfoCard, EmptyState, LoadingState, StatusBadge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { goalService } from '../../services/goalService';
import type { Student, WeeklyGoal } from '../../types';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingGoals, setPendingGoals] = useState<(WeeklyGoal & { student: Student })[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [s, g] = await Promise.allSettled([
          studentService.getByInstructor(user.id),
          goalService.getPendingApprovals(user.id),
        ]);
        if (s.status === 'fulfilled') setStudents(s.value);
        if (g.status === 'fulfilled') setPendingGoals(g.value as (WeeklyGoal & { student: Student })[]);
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
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-neutral-500 mt-1">Instructor Overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Assigned Students" value={students.length} icon={<GraduationCap size={18} />} color="primary" />
          <MetricCard title="Pending Approvals" value={pendingGoals.length} icon={<FileCheck size={18} />} color={pendingGoals.length > 0 ? 'warning' : 'success'} />
          <MetricCard title="Evaluations Due" value="—" icon={<ClipboardList size={18} />} color="primary" />
          <MetricCard title="At Risk" value="—" icon={<AlertTriangle size={18} />} color="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students */}
          <InfoCard
            title="My Students"
            action={<Link to="/instructor/students" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
          >
            {students.length === 0 ? (
              <EmptyState title="No students assigned" />
            ) : (
              <div className="space-y-2">
                {students.slice(0, 5).map((s) => (
                  <Link key={s.id} to={`/instructor/students/${s.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {s.user?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800">{s.user?.full_name}</p>
                      <p className="text-xs text-neutral-400">{s.current_level || 'No level set'}</p>
                    </div>
                    <StatusBadge status={'active'} label={'active'} />
                  </Link>
                ))}
              </div>
            )}
          </InfoCard>

          {/* Pending goal approvals */}
          <InfoCard
            title="Pending Goal Approvals"
            action={<Link to="/instructor/goal-approvals" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
          >
            {pendingGoals.length === 0 ? (
              <EmptyState title="No pending approvals" />
            ) : (
              <div className="space-y-2">
                {pendingGoals.slice(0, 5).map((g) => (
                  <div key={g.id} className="p-2.5 rounded-xl bg-warning-50 border border-warning-200">
                    <p className="text-xs font-medium text-warning-700">{(g.student as unknown as { user: { full_name: string } })?.user?.full_name}</p>
                    <p className="text-sm text-neutral-800 mt-0.5 line-clamp-2">{g.title}</p>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
