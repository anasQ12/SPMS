import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui'
import { userService } from '../../services/userService'
import type { AppUser } from '../../types'
import { Search, UserPlus, Shield, Ban } from 'lucide-react'
import { toast } from '../../components/ui'

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [filtered, setFiltered] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [confirmSuspend, setConfirmSuspend] = useState<AppUser | null>(null)

  useEffect(() => { loadUsers() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)))
  }, [search, users])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data.filter(u => !u.roles?.includes('manager')))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSuspend() {
    if (!confirmSuspend) return
    try {
      await userService.suspend(confirmSuspend.id)
      toast.success('User suspended')
      loadUsers()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error')
    }
    setConfirmSuspend(null)
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadUsers} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <button className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input className="input-field pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No users found" description="No users match your search." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Roles</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(r => (
                          <span key={r} className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'active' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                        {user.status === 'active' ? 'Active' : user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setConfirmSuspend(user)} className="p-1.5 rounded hover:bg-warning-100 text-warning-600" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-primary-100 text-primary-600" title="Manage Roles">
                          <Shield className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {confirmSuspend && (
          <ConfirmDialog
            open={true}
            title="Suspend User"
            message={`Are you sure you want to suspend ${confirmSuspend.full_name}?`}
            onConfirm={handleSuspend}
            onCancel={() => setConfirmSuspend(null)}
            confirmLabel="Suspend"
            variant="danger"
          />
        )}
      </div>
    </DashboardLayout>
  )
}
