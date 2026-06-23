import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui'
import { finalEvaluationService } from '../../services'
import type { FinalEvaluation } from '../../types'
import { CheckCircle } from 'lucide-react'
import { toast } from '../../components/ui'

export default function ManagerFinalEvaluations() {
  const [evals, setEvals] = useState<FinalEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<FinalEvaluation | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await (finalEvaluationService as any).getPending()
      setEvals(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!confirmApprove) return
    try {
      await finalEvaluationService.approve(confirmApprove.id, confirmApprove.system_calculated_score || 0)
      toast.success('Final evaluation approved')
      load()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    setConfirmApprove(null)
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Final Evaluations</h1>
        {evals.length === 0 ? (
          <EmptyState title="No pending evaluations" description="All final evaluations have been processed." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">System Score</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Recommended</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Manager Score</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {evals.map(e => (
                  <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{e.student?.user?.full_name || e.student_id}</td>
                    <td className="px-4 py-3">{e.system_calculated_score ?? '-'}</td>
                    <td className="px-4 py-3">{e.super_admin_recommended_score ?? '-'}</td>
                    <td className="px-4 py-3 font-semibold text-primary-700">{e.manager_final_score ?? 'Pending'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-warning-100 text-warning-700">{e.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmApprove(e)} className="p-1.5 rounded hover:bg-success-100 text-success-600" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmApprove}
          title="Approve Final Evaluation"
          message="Approve the final evaluation for this student?"
          onConfirm={handleApprove}
          onCancel={() => setConfirmApprove(null)}
          confirmLabel="Approve"
        />
      </div>
    </DashboardLayout>
  )
}
