import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui'
import { userService } from '../../services/userService'
import type { AppUser } from '../../types'
import { Search } from 'lucide-react'

export default function SuperAdminInstructors() {
  const [instructors, setInstructors] = useState<AppUser[]>([])
  const [filtered, setFiltered] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadInstructors() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(instructors.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)))
  }, [search, instructors])

  async function loadInstructors() {
    try {
      setLoading(true)
      const all = await userService.getAll()
      setInstructors(all.filter(u => u.roles?.includes('instructor')))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadInstructors} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Instructor Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input className="input-field pl-10" placeholder="Search instructors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No instructors" description="No instructors found." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                    <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${u.status === 'active' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                        {u.status === 'active' ? 'Active' : u.status}
                      </span>
                    </td>
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
