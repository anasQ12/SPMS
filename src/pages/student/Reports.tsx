import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { InfoCard, EmptyState, LoadingState } from '../../components/ui';
import { toast } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { studentService } from '../../services/studentService';
import { evaluationService } from '../../services/evaluationService';
import { goalService } from '../../services/goalService';
import type { Student, Evaluation, WeeklyGoal } from '../../types';

export default function StudentReports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const s = await studentService.getByUserId(user.id);
      if (!s) return;
        setStudent(s);
        const [e, g] = await Promise.allSettled([
          evaluationService.getByStudent(s.id),
          goalService.getByStudent(s.id),
        ]);
        if (e.status === 'fulfilled') setEvaluations(e.value);
        if (g.status === 'fulfilled') setGoals(g.value);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const exportWeeklyPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Weekly Progress Report', 20, 25);
      doc.setFontSize(11);
      doc.text(`Student: ${user?.full_name}`, 20, 40);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);

      let y = 65;
      doc.setFontSize(13);
      doc.text('Goals', 20, y);
      y += 10;
      doc.setFontSize(10);

      const weekGoals = goals.filter((g) => g.week !== undefined).slice(0, 10);
      weekGoals.forEach((g) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.text(`• [${g.status}] ${g.title.substring(0, 80)}`, 20, y);
        y += 8;
      });

      y += 10;
      doc.setFontSize(13);
      doc.text('Evaluations', 20, y);
      y += 10;
      doc.setFontSize(10);

      evaluations.slice(0, 5).forEach((e) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.text(`• ${e.evaluation_period} — Score: ${e.calculated_score?.toFixed(1) || 'N/A'}`, 20, y);
        y += 8;
        if (e.public_comment) {
          doc.text(`  ${e.public_comment.substring(0, 90)}`, 20, y);
          y += 7;
        }
      });

      doc.save(`SPMS_Weekly_Report_${user?.full_name?.replace(/\s/g, '_')}.pdf`);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const weeklyEvals = evaluations.filter((e) => e.evaluation_period === 'weekly');
  const monthlyEvals = evaluations.filter((e) => e.evaluation_period === 'monthly');
  const finalEval = evaluations.find((e) => e.evaluation_period === 'end_program');

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">{t('reports.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly report card */}
          <div className="card p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <FileText size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{t('reports.weekly')}</p>
                <p className="text-xs text-neutral-400">{weeklyEvals.length} evaluations</p>
              </div>
            </div>
            <button onClick={exportWeeklyPDF} className="btn-primary w-full text-sm justify-center">
              <Download size={14} /> {t('reports.downloadPDF')}
            </button>
          </div>

          {/* Monthly report card */}
          <div className="card p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                <FileText size={18} className="text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{t('reports.monthly')}</p>
                <p className="text-xs text-neutral-400">{monthlyEvals.length} evaluations</p>
              </div>
            </div>
            <button onClick={exportWeeklyPDF} className="btn-secondary w-full text-sm justify-center">
              <Download size={14} /> {t('reports.downloadPDF')}
            </button>
          </div>

          {/* End of program */}
          <div className={`card p-5 ${!finalEval ? 'opacity-60' : 'hover:shadow-md'} transition`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center">
                <FileText size={18} className="text-success-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{t('reports.endProgram')}</p>
                <p className="text-xs text-neutral-400">
                  {finalEval ? 'Available' : 'Not yet available'}
                </p>
              </div>
            </div>
            <button
              disabled={!finalEval}
              onClick={exportWeeklyPDF}
              className="btn-secondary w-full text-sm justify-center disabled:opacity-40"
            >
              <Download size={14} /> {t('reports.downloadPDF')}
            </button>
          </div>
        </div>

        {/* Summary */}
        <InfoCard title="Progress Summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{goals.length}</p>
              <p className="text-xs text-neutral-500 mt-1">Total Goals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-700">
                {goals.filter((g) => g.status === 'completed' || g.status === 'approved').length}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Achieved Goals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{evaluations.length}</p>
              <p className="text-xs text-neutral-500 mt-1">Evaluations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-800">
                {weeklyEvals.length > 0
                  ? (weeklyEvals.reduce((s, e) => s + (e.calculated_score || 0), 0) / weeklyEvals.length).toFixed(1)
                  : '—'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Avg Score</p>
            </div>
          </div>
        </InfoCard>
      </div>
    </DashboardLayout>
  );
}
