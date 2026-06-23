import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui'
import { performanceRecordService } from '../../services'
import type { PerformanceRecord } from '../../types'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from '../../components/ui'

export default function ManagerPerformanceApprovals() {
  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<PerformanceRecord | null>(null)
  const [confirmReject, setConfirmReject] = useState<PerformanceRecord | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await (performanceRecordService as any).getPending()
      setRecords(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!confirmApprove) return
    try {
      await (performanceRecordService as any).approve(confirmApprove.id)
      toast.success('Record approved')
      load()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    setConfirmApprove(null)
  }

  async function handleReject() {
    if (!confirmReject) return
    try {
      await (performanceRecordService as any).reject(confirmReject.id, 'Rejected by manager')
      toast.success('Record rejected')
      load()
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    setConfirmReject(null)
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Performance Records Approval</h1>
        {records.length === 0 ? (
          <EmptyState title="No pending records" description="All performance records have been reviewed." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{r.student?.user?.full_name || r.student_id}</td>
                    <td className="px-4 py-3 capitalize">{r.record_type?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">{r.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setConfirmApprove(r)} className="p-1.5 rounded hover:bg-success-100 text-success-600">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmReject(r)} className="p-1.5 rounded hover:bg-danger-100 text-danger-600">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmApprove}
          title="Approve Record"
          message={`Approve this performance record?`}
          onConfirm={handleApprove}
          onCancel={() => setConfirmApprove(null)}
          confirmLabel="Approve"
        />

        <ConfirmDialog
          open={!!confirmReject}
          title="Reject Record"
          message="Are you sure you want to reject this record?"
          onConfirm={handleReject}
          onCancel={() => setConfirmReject(null)}
          confirmLabel="Reject"
          variant="danger"
          reasonRequired={true}
        />
      </div>
    </DashboardLayout>
  )
}
