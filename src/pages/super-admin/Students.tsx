import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState } from '../../components/ui'
import { studentService } from '../../services/studentService'
import type { Student } from '../../types'
import { Search, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SuperAdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadStudents() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(students.filter(s =>
      s.user?.full_name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.current_level?.toLowerCase().includes(q)
    ))
  }, [search, students])

  async function loadStudents() {
    try {
      setLoading(true)
      const data = await studentService.getAll()
      setStudents(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadStudents} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Student Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input className="input-field pl-10" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No students" description="No students match your search." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{s.user?.full_name}</td>
                    <td className="px-4 py-3 text-neutral-500">{s.current_level || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${true ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/instructor/students/${s.id}`)} className="p-1.5 rounded hover:bg-primary-100 text-primary-600" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
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
