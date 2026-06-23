import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui'
import { auditService } from '../../services'
import type { AuditLog } from '../../types'
import { Search, Filter } from 'lucide-react'

export default function ManagerAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [entityFilter, setEntityFilter] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await (auditService as any).getAll({ dateFrom, dateTo, entityType: entityFilter })
      setLogs(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    return (
      l.action?.toLowerCase().includes(q) ||
      l.entity_type?.toLowerCase().includes(q) ||
      l.user?.full_name?.toLowerCase().includes(q)
    )
  })

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input className="input-field pl-10" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="input-field w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="input-field w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <input className="input-field w-auto" placeholder="Entity type..." value={entityFilter} onChange={e => setEntityFilter(e.target.value)} />
          <button onClick={load} className="btn-primary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No audit logs" description="No logs match your filters." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">User</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Entity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 font-medium">{l.user?.full_name || l.actor_user_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">{l.action}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{l.entity_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
