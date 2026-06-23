import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout'
import { LoadingState, ErrorState } from '../../components/ui'
import { programService } from '../../services'
import { toast } from '../../components/ui'
import { Save } from 'lucide-react'
import type { Program } from '../../types'

export default function ManagerSettings() {
  const [program, setProgram] = useState<Program | null>(null)
  const [settings, setSettings] = useState({
    programName: '',
    goalDeadlineDay: 'sunday',
    maxGoalsPerWeek: '3',
    language: 'ar',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const p = await (programService as any).getActive() as Program | null
      if (p) {
        setProgram(p)
        setSettings(prev => ({ ...prev, programName: p.name_en || p.name_ar || '' }))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      if (program) {
        await programService.update(program.id, { name: settings.programName })
      }
      toast.success('Settings saved successfully')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout><LoadingState /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900">Program Settings</h1>
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-neutral-800">Program Configuration</h2>
          <div>
            <label className="label">Program Name</label>
            <input className="input-field" value={settings.programName} onChange={e => setSettings(p => ({ ...p, programName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Goal Submission Deadline</label>
            <select className="input-field" value={settings.goalDeadlineDay} onChange={e => setSettings(p => ({ ...p, goalDeadlineDay: e.target.value }))}>
              {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Max Goals Per Week</label>
            <select className="input-field" value={settings.maxGoalsPerWeek} onChange={e => setSettings(p => ({ ...p, maxGoalsPerWeek: e.target.value }))}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className="label">Default Language</label>
            <select className="input-field" value={settings.language} onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
