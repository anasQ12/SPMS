import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, InfoCard, EmptyState } from '../../components/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { studentService } from '../../services/studentService'
import { goalService } from '../../services/goalService'
import { evaluationService } from '../../services/evaluationService'
import type { Student, WeeklyGoal, Evaluation } from '../../types'
import { ProgressLineChart } from '../../components/charts'
import { ArrowLeft, User, Target, ClipboardList, Star, FileText, Award } from 'lucide-react'

const TABS = ['profile', 'goals', 'evaluations', 'recommendations', 'records', 'reports'] as const
type Tab = typeof TABS[number]

export default function InstructorStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [student, setStudent] = useState<Student | null>(null)
  const [goals, setGoals] = useState<WeeklyGoal[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (studentId) loadData() }, [studentId])

  async function loadData() {
    try {
      setLoading(true)
      const [s, g, e] = await Promise.all([
        studentService.getById(studentId!),
        goalService.getByStudent(studentId!),
        evaluationService.getByStudent(studentId!),
      ])
      setStudent(s)
      setGoals(g)
      setEvaluations(e)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const tabIcons: Record<Tab, React.ReactNode> = {
    profile: <User className="w-4 h-4" />,
    goals: <Target className="w-4 h-4" />,
    evaluations: <ClipboardList className="w-4 h-4" />,
    recommendations: <Star className="w-4 h-4" />,
    records: <Award className="w-4 h-4" />,
    reports: <FileText className="w-4 h-4" />,
  }

  const tabLabels: Record<Tab, string> = {
    profile: 'Profile',
    goals: 'Goals',
    evaluations: 'Evaluations',
    recommendations: 'Recommendations',
    records: 'Performance Records',
    reports: t('nav.reports') || 'Reports',
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadData} /></DashboardLayout>
  if (!student) return <DashboardLayout><ErrorState message="Student not found" /></DashboardLayout>

  const scoreData = evaluations.slice(0, 10).reverse().map((e, i) => ({
    week: `W${i + 1}`,
    score: e.calculated_score || 0,
  }))

  const statusColors: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-700',
    submitted: 'bg-primary-100 text-primary-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-danger-100 text-danger-700',
    recommended_for_edit: 'bg-warning-100 text-warning-700',
    locked: 'bg-neutral-200 text-neutral-600',
    completed: 'bg-success-100 text-success-700',
    carried_over: 'bg-accent-100 text-accent-700',
    missed_submission: 'bg-danger-100 text-danger-700',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{student.user?.full_name}</h1>
            <p className="text-neutral-500">{student.current_level} • {student.user?.email}</p>
          </div>
        </div>

        <div className="border-b border-neutral-200">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tabIcons[tab]}
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="Student Information">
              <dl className="space-y-3">
                {([
                  ['Name', student.user?.full_name],
                  ['Email', student.user?.email],
                  ['Level', student.current_level],
                  ['DOB', student.dob],
                  ['Social Status', student.social_status],
                ] as [string, string | undefined][]).map(([label, value]) => value ? (
                  <div key={label} className="flex justify-between">
                    <dt className="text-neutral-500 text-sm">{label}</dt>
                    <dd className="text-neutral-900 text-sm font-medium">{value}</dd>
                  </div>
                ) : null)}
              </dl>
            </InfoCard>
            {(student.strengths || student.weaknesses || student.hobbies) && (
              <InfoCard title="Profile Details">
                {student.strengths && <div className="mb-3"><p className="text-xs text-neutral-500 mb-1">Strengths</p><p className="text-sm">{student.strengths}</p></div>}
                {student.weaknesses && <div className="mb-3"><p className="text-xs text-neutral-500 mb-1">Weaknesses</p><p className="text-sm">{student.weaknesses}</p></div>}
                {student.hobbies && <div><p className="text-xs text-neutral-500 mb-1">Hobbies</p><p className="text-sm">{student.hobbies}</p></div>}
              </InfoCard>
            )}
            {scoreData.length > 0 && (
              <div className="md:col-span-2">
                <InfoCard title="Score Trend">
                  <ProgressLineChart data={scoreData} />
                </InfoCard>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-3">
            {goals.length === 0 ? (
              <EmptyState title="No goals" description="Student has no goals yet." />
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Goal</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Week</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.map(goal => (
                      <tr key={goal.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-4 py-3">{goal.title}</td>
                        <td className="px-4 py-3 text-neutral-500">{goal.week?.week_number ? `Week ${goal.week.week_number}` : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[goal.status] || 'bg-neutral-100 text-neutral-700'}`}>
                            {goal.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div className="space-y-3">
            {evaluations.length === 0 ? (
              <EmptyState title="No evaluations" description="No evaluations recorded yet." />
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Score</th>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map(ev => (
                      <tr key={ev.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                        <td className="px-4 py-3 capitalize">{ev.evaluation_period?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 font-semibold text-primary-700">{ev.calculated_score ?? '-'}</td>
                        <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{ev.public_comment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'recommendations' || activeTab === 'records' || activeTab === 'reports') && (
          <EmptyState title="Coming soon" description="This section will be available soon." />
        )}
      </div>
    </DashboardLayout>
  )
}
