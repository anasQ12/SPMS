import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { MetricCard, LoadingState, ErrorState } from '../../components/ui'
import { dashboardService } from '../../services'
import { Users, Star, ClipboardCheck, AlertTriangle, Award, TrendingUp } from 'lucide-react'
import { ProgramTrendChart, InstructorPerformanceChart } from '../../components/charts'

export default function ManagerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await (dashboardService as any).getManagerStats()
      setStats(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Executive Dashboard</h1>
          <p className="text-neutral-500 mt-1">Active Program: {stats?.programName || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Overall Student Average" value={`${stats?.overallAvg ?? 0}%`} icon={<TrendingUp className="w-5 h-5" />} color="primary" />
          <MetricCard title="Instructor Performance Avg" value={`${stats?.instructorAvg ?? 0}%`} icon={<Star className="w-5 h-5" />} color="primary" />
          <MetricCard title="Pending Final Evaluations" value={stats?.pendingFinalEvals ?? 0} icon={<ClipboardCheck className="w-5 h-5" />} color="warning" />
          <MetricCard title="Pending Performance Records" value={stats?.pendingRecords ?? 0} icon={<Award className="w-5 h-5" />} color="warning" />
          <MetricCard title="Total Students" value={stats?.totalStudents ?? 0} icon={<Users className="w-5 h-5" />} color="primary" />
          <MetricCard title="Risk Indicators" value={stats?.riskCount ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="danger" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Program Trend</h2>
            <ProgramTrendChart data={stats?.programTrend || []} />
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Instructor Performance</h2>
            <InstructorPerformanceChart data={stats?.instructorPerformance || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
