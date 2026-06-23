import { DashboardLayout } from '../../components/layout'
import { InfoCard } from '../../components/ui'
import { FileText, Download } from 'lucide-react'

export default function ManagerReports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Program Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Program Summary Report', 'Student Performance Report', 'Instructor Evaluation Report', 'Final Evaluations Report'].map(r => (
            <InfoCard key={r} title={r} action={
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Generate
              </button>
            }>
              <FileText className="w-8 h-8 text-neutral-300" />
            </InfoCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
