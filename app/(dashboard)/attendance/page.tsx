'use client'
import { useState, useEffect } from 'react'
import { groupsApi, attendanceApi } from '@/lib/api'
import { CheckCircle, XCircle, Clock, Loader2, Save } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Keldi', icon: <CheckCircle size={14} />, color: '#10B981' },
  { value: 'ABSENT',  label: 'Kelmadi', icon: <XCircle size={14} />, color: '#EF4444' },
  { value: 'LATE',    label: 'Kech', icon: <Clock size={14} />, color: '#F59E0B' },
]

export default function AttendancePage() {
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<Record<number, string>>({})
  const [existing, setExisting] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    groupsApi.list().then(r => {
      const g = r.data || []
      setGroups(g)
      if (g.length > 0) selectGroup(g[0])
    })
  }, [])

  const selectGroup = async (group: any) => {
    setSelectedGroup(group)
    setLoading(true)
    const studRes = await groupsApi.students(group.id)
    const studs = studRes.data || []
    setStudents(studs)

    // Load existing attendance for this date
    const attRes = await attendanceApi.list({ group_id: group.id, date })
    const existingRecords = attRes.data || []
    setExisting(existingRecords)

    const initial: Record<number, string> = {}
    studs.forEach((s: any) => {
      const found = existingRecords.find((a: any) => a.student === s.id)
      initial[s.id] = found ? found.status : 'PRESENT'
    })
    setRecords(initial)
    setLoading(false)
    setSaved(false)
  }

  useEffect(() => {
    if (selectedGroup) selectGroup(selectedGroup)
  }, [date])

  const setStatus = (studentId: number, status: string) => {
    setRecords(r => ({ ...r, [studentId]: status }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedGroup) return
    setSaving(true)
    const recs = students.map(s => ({
      student_id: s.id,
      status: records[s.id] || 'PRESENT'
    }))
    await attendanceApi.bulk({ group_id: selectedGroup.id, date, records: recs })
    setSaving(false)
    setSaved(true)
  }

  const present = Object.values(records).filter(s => s === 'PRESENT').length
  const absent = Object.values(records).filter(s => s === 'ABSENT').length
  const late = Object.values(records).filter(s => s === 'LATE').length
  const pct = students.length > 0 ? Math.round(present / students.length * 100) : 0

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Davomat</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Guruh bo'yicha davomatni belgilash</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <button onClick={handleSave} disabled={saving || !selectedGroup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: saved ? '#10B981' : 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? 'Saqlandi ✓' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Group list */}
        <div className="space-y-2">
          {groups.map(g => (
            <button key={g.id} onClick={() => selectGroup(g)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={selectedGroup?.id === g.id
                ? { background: 'rgba(79,142,247,0.15)', color: 'var(--primary)', border: '1px solid rgba(79,142,247,0.3)' }
                : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
              <p className="font-semibold">{g.name}</p>
              <p className="text-xs opacity-70 mt-0.5">{g.course?.name}</p>
            </button>
          ))}
        </div>

        {/* Attendance table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Jami', value: students.length, color: 'var(--primary)' },
              { label: 'Keldi', value: present, color: '#10B981' },
              { label: 'Kelmadi', value: absent, color: '#EF4444' },
              { label: 'Kech', value: late, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-3 text-center"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text2)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Davomat: {pct}%</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#10B981' }} />
            </div>
          </div>

          {/* Students */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: s.course?.color || 'var(--primary)' }}>
                    {s.first_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.full_name}</p>
                  </div>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setStatus(s.id, opt.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={records[s.id] === opt.value
                          ? { background: `${opt.color}20`, color: opt.color, border: `1px solid ${opt.color}40` }
                          : { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid transparent' }}>
                        {opt.icon}{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-16 text-sm" style={{ color: 'var(--text2)' }}>
                  Guruhda student yo'q
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
