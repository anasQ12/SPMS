import { DashboardLayout } from '../../components/layout'
import { InfoCard } from '../../components/ui'
import { FileText, Download } from 'lucide-react'

const REPORT_TYPES = [
  { title: 'Student Progress Reports', desc: 'Individual student progress and evaluation summaries' },
  { title: 'Instructor Activity Reports', desc: 'Instructor evaluation and goal approval activity' },
  { title: 'Program Summary', desc: 'Overall program statistics and progress' },
  { title: 'Monthly Summary', desc: 'Month-by-month performance overview' },
]

export default function SuperAdminReports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_TYPES.map(r => (
            <InfoCard key={r.title} title={r.title} action={
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Generate
              </button>
            }>
              <div className="flex items-start gap-3">
                <FileText className="w-8 h-8 text-primary-400 flex-shrink-0 mt-1" />
                <p className="text-neutral-600 text-sm">{r.desc}</p>
              </div>
            </InfoCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
