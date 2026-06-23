import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState, StatusBadge } from '../../components/ui';
import { EvaluationBarChart } from '../../components/charts';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { evaluationService } from '../../services/evaluationService';
import type { Evaluation } from '../../types';

export default function StudentEvaluations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'end_program'>('weekly');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const student = await studentService.getByUserId(user.id);
        if (!student) return;
        const e = await evaluationService.getByStudent(student.id);
        setEvaluations(e);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = evaluations.filter((e) => e.evaluation_period === activeTab);

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('evaluations.title')}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
          {(['weekly', 'monthly', 'end_program'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              {t(`evaluations.${tab}`)}
            </button>
          ))}
        </div>

        {/* Chart for weekly */}
        {activeTab === 'weekly' && filtered.length > 0 && (
          <InfoCard title="Weekly Score Trend">
            <EvaluationBarChart
              data={filtered.slice(0, 8).reverse().map((e, i) => ({
                name: `W${i + 1}`,
                score: e.calculated_score || 0,
              }))}
            />
          </InfoCard>
        )}

        {/* Evaluations list */}
        <InfoCard title={`${t(`evaluations.${activeTab}`)} Evaluations`}>
          {filtered.length === 0 ? (
            <EmptyState title={`No ${activeTab} evaluations yet`} />
          ) : (
            <div className="space-y-4">
              {filtered.map((ev) => (
                <EvaluationCard key={ev.id} evaluation={ev} t={t} />
              ))}
            </div>
          )}
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}

const EvaluationCard: React.FC<{ evaluation: Evaluation; t: (k: string) => string }> = ({ evaluation, t }) => (
  <div className="border border-neutral-100 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-sm">
          {evaluation.calculated_score != null ? evaluation.calculated_score.toFixed(0) : '—'}
        </div>
        <div>
          <p className="font-semibold text-neutral-800 capitalize">{evaluation.evaluation_period} Evaluation</p>
          <p className="text-xs text-neutral-400">
            {evaluation.week ? `Week ${evaluation.week.week_number}` : ''} •{' '}
            {new Date(evaluation.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {evaluation.instructor && (
        <p className="text-xs text-neutral-400">By {evaluation.instructor.full_name}</p>
      )}
    </div>

    {/* Category scores */}
    {evaluation.scores && evaluation.scores.length > 0 && (
      <div className="grid grid-cols-2 gap-2 mb-3">
        {evaluation.scores.map((score) => (
          <div key={score.id} className="flex justify-between items-center bg-neutral-50 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-neutral-600">{score.category?.name_en || 'Category'}</span>
            <span className="font-semibold text-primary-600">{score.score}</span>
          </div>
        ))}
      </div>
    )}

    {evaluation.public_comment && (
      <div className="bg-neutral-50 rounded-lg px-3 py-2 text-sm text-neutral-700">
        <span className="font-medium text-xs text-neutral-500 uppercase tracking-wide block mb-1">Comment</span>
        {evaluation.public_comment}
      </div>
    )}
  </div>
);
