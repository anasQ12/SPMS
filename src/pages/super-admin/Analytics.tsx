import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState } from '../../components/ui'
import { dashboardService } from '../../services'
import { ProgressLineChart, EvaluationBarChart, GoalCompletionChart, RiskPieChart, InstructorPerformanceChart } from '../../components/charts'

export default function SuperAdminAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const stats = await (dashboardService as any).getSuperAdminStats()
      setData(stats)
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
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Student Progress Trends</h2>
            <ProgressLineChart data={data?.progressTrend || []} />
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Goal Completion Rate</h2>
            <GoalCompletionChart data={data?.goalCompletionData || []} />
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Evaluation Averages</h2>
            <EvaluationBarChart data={data?.evaluationAverages || []} />
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Risk Overview</h2>
            <RiskPieChart
              safe={data?.riskData?.safe ?? 0}
              warning={data?.riskData?.warning ?? 0}
              risk={data?.riskData?.risk ?? 0}
            />
          </div>
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Instructor Performance</h2>
            <InstructorPerformanceChart data={data?.instructorPerformance || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
