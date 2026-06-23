import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { MetricCard, LoadingState, ErrorState } from '../../components/ui'
import { dashboardService } from '../../services'
import { Users, BookOpen, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react'
import { GoalCompletionChart, RiskPieChart } from '../../components/charts'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const data = await (dashboardService as any).getSuperAdminStats()
      setStats(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadStats} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Super Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Total Students" value={stats?.totalStudents ?? 0} icon={<Users className="w-5 h-5" />} color="primary" />
          <MetricCard title="Total Instructors" value={stats?.totalInstructors ?? 0} icon={<UserCheck className="w-5 h-5" />} color="primary" />
          <MetricCard title="Missing Goals This Week" value={stats?.missingGoals ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="warning" />
          <MetricCard title="Evaluation Completion" value={`${stats?.evalCompletionRate ?? 0}%`} icon={<CheckCircle className="w-5 h-5" />} color="success" />
          <MetricCard title="Active Program Week" value={stats?.currentWeek ?? '-'} icon={<BookOpen className="w-5 h-5" />} color="primary" />
          <MetricCard title="Students Needing Attention" value={stats?.studentsAtRisk ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="danger" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Goal Completion Rate</h2>
            <GoalCompletionChart data={stats?.goalCompletionData || []} />
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Risk Overview</h2>
            <RiskPieChart safe={stats?.riskData?.safe ?? 0} warning={stats?.riskData?.warning ?? 0} risk={stats?.riskData?.risk ?? 0} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
