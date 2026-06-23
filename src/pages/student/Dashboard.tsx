import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ClipboardList, Bell, TrendingUp, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { MetricCard, InfoCard, EmptyState, LoadingState, StatusBadge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { goalService } from '../../services/goalService';
import { evaluationService } from '../../services/evaluationService';
import { notificationService } from '../../services/index';
import { dashboardService } from '../../services/index';
import type { WeeklyGoal, Evaluation } from '../../types';
import { ProgressLineChart } from '../../components/charts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const student = await studentService.getByUserId(user.id);
        if (!student) return;
        setStudentId(student.id);
        const [g, e, n] = await Promise.allSettled([
          goalService.getByStudent(student.id),
          evaluationService.getByStudent(student.id),
          notificationService.getUnreadCount(user.id),
        ]);
        if (g.status === 'fulfilled') setGoals(g.value.slice(0, 5));
        if (e.status === 'fulfilled') setEvaluations(e.value.slice(0, 5));
        if (n.status === 'fulfilled') setUnreadCount(n.value);
      } catch {
        // Show empty states
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const latestScore = evaluations[0]?.calculated_score;
  const approvedGoals = goals.filter((g) => g.status === 'approved' || g.status === 'completed').length;
  const pendingGoals = goals.filter((g) => g.status === 'submitted').length;

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  const scoreData = evaluations
    .slice(0, 8)
    .reverse()
    .map((e, i) => ({ week: `W${i + 1}`, score: e.calculated_score || 0 }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('dashboard.welcomeBack')}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Here's your progress overview</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('dashboard.submittedGoals')}
            value={goals.length}
            icon={<Target size={18} />}
            color="primary"
          />
          <MetricCard
            title="Approved Goals"
            value={approvedGoals}
            icon={<CheckCircle size={18} />}
            color="success"
          />
          <MetricCard
            title={t('dashboard.latestScore')}
            value={latestScore != null ? `${latestScore.toFixed(1)}` : '—'}
            icon={<TrendingUp size={18} />}
            color="primary"
          />
          <MetricCard
            title={t('notifications')}
            value={unreadCount}
            icon={<Bell size={18} />}
            color={unreadCount > 0 ? 'warning' : 'primary'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress chart */}
          <div className="lg:col-span-2">
            <InfoCard title="Score Trend">
              {scoreData.length > 0 ? (
                <ProgressLineChart data={scoreData} />
              ) : (
                <EmptyState title="No evaluations yet" description="Your scores will appear here once evaluations are added." />
              )}
            </InfoCard>
          </div>

          {/* Current goals */}
          <InfoCard
            title="Current Goals"
            action={<Link to="/student/goals" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
          >
            {goals.length === 0 ? (
              <EmptyState title="No goals yet" description="Submit your first weekly goal." />
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 line-clamp-2">{goal.title}</p>
                      <div className="mt-1">
                        <StatusBadge
                          status={goal.status}
                          label={t(`goals.statuses.${goal.status}`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Latest evaluations */}
        <InfoCard
          title="Latest Evaluations"
          action={<Link to="/student/evaluations" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
        >
          {evaluations.length === 0 ? (
            <EmptyState title="No evaluations yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-start text-neutral-500 font-medium py-2 pe-4">Type</th>
                    <th className="text-start text-neutral-500 font-medium py-2 pe-4">Score</th>
                    <th className="text-start text-neutral-500 font-medium py-2 pe-4">Date</th>
                    <th className="text-start text-neutral-500 font-medium py-2">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.slice(0, 5).map((ev) => (
                    <tr key={ev.id} className="border-b border-neutral-50">
                      <td className="py-2.5 pe-4 capitalize font-medium text-neutral-700">{ev.evaluation_period}</td>
                      <td className="py-2.5 pe-4">
                        {ev.calculated_score != null ? (
                          <span className="font-semibold text-primary-600">{ev.calculated_score.toFixed(1)}</span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 pe-4 text-neutral-500">
                        {new Date(ev.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-neutral-500 text-xs max-w-48 truncate">
                        {ev.public_comment || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
