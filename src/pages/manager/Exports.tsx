import { DashboardLayout } from '../../components/layout'
import { InfoCard } from '../../components/ui'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from '../../components/ui'
import * as XLSX from 'xlsx'
import { studentService } from '../../services/studentService'
import { auditService } from '../../services'

async function exportToExcel(filename: string, data: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export default function ManagerExports() {
  async function handleStudentsExport() {
    try {
      const students = await studentService.getAll()
      const rows = students.map(s => ({
        Name: s.user?.full_name || '',
        Email: s.user?.email || '',
        Level: s.current_level || '',
        DOB: s.dob || '',
        Status: 'active',
      }))
      await exportToExcel('students', rows)
      toast.success('Students exported')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
  }

  async function handleAuditExport() {
    try {
      const logs = await (auditService as any).getAll({})
      const rows = logs.map((l: { created_at?: string; user?: { full_name?: string }; actor_user_id?: string; action?: string; entity_type?: string }) => ({
        Time: l.created_at || '',
        User: l.user?.full_name || l.actor_user_id || '',
        Action: l.action || '',
        Entity: l.entity_type || '',
      }))
      await exportToExcel('audit_logs', rows)
      toast.success('Audit logs exported')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
  }

  const exports = [
    { title: 'Students Excel', desc: 'Export all student data', icon: <FileSpreadsheet className="w-8 h-8 text-success-500" />, action: handleStudentsExport },
    { title: 'Audit Logs Excel', desc: 'Export complete audit trail', icon: <FileSpreadsheet className="w-8 h-8 text-primary-500" />, action: handleAuditExport },
    { title: 'Program PDF', desc: 'Full program summary report', icon: <FileText className="w-8 h-8 text-neutral-400" />, action: () => toast.success('PDF generation coming soon') },
    { title: 'Evaluations Excel', desc: 'Export all evaluations', icon: <FileSpreadsheet className="w-8 h-8 text-warning-500" />, action: () => toast.success('Coming soon') },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Data Exports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exports.map(exp => (
            <InfoCard key={exp.title} title={exp.title} action={
              <button onClick={exp.action} className="btn-primary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            }>
              <div className="flex items-start gap-3">
                {exp.icon}
                <p className="text-neutral-600 text-sm">{exp.desc}</p>
              </div>
            </InfoCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
