'use client'
import { useState, useEffect } from 'react'
import { groupsApi } from '@/lib/api'
import { Loader2, Clock, Users, MapPin } from 'lucide-react'

const DAYS = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sha', full: 'Shanba' },
  { short: 'Ya', full: "Yakshanba" },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316']

export default function SchedulePage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'week' | 'list'>('week')

  useEffect(() => {
    groupsApi.list().then(r => {
      setGroups(r.data || [])
      setLoading(false)
    })
  }, [])

  // Build schedule by day
  const byDay: Record<string, any[]> = {}
  DAYS.forEach(d => { byDay[d.short] = [] })
  groups.forEach((g, idx) => {
    (g.days || []).forEach((day: string) => {
      if (byDay[day]) byDay[day].push({ ...g, colorIdx: idx % COLORS.length })
    })
  })

  const today = new Date()
  const todayShort = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'][today.getDay()]

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Dars jadvali</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{groups.length} ta guruh</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={view === v
                ? { background: 'var(--primary)', color: '#fff' }
                : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
              {v === 'week' ? 'Hafta' : "Ro'yxat"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(day => (
            <div key={day.short} className="min-h-64">
              <div className="text-center py-2 rounded-xl mb-2 text-sm font-bold"
                style={day.short === todayShort
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                <p className="text-xs opacity-70 hidden sm:block">{day.full}</p>
                <p>{day.short}</p>
              </div>
              <div className="space-y-2">
                {byDay[day.short].map(g => (
                  <div key={g.id} className="p-2.5 rounded-xl text-xs"
                    style={{ background: `${COLORS[g.colorIdx]}18`, border: `1px solid ${COLORS[g.colorIdx]}30` }}>
                    <p className="font-bold truncate" style={{ color: COLORS[g.colorIdx] }}>{g.name}</p>
                    <p className="flex items-center gap-1 mt-1" style={{ color: 'var(--text2)' }}>
                      <Clock size={9} />{g.start_time}–{g.end_time}
                    </p>
                    {g.room && (
                      <p className="flex items-center gap-1" style={{ color: 'var(--text2)' }}>
                        <MapPin size={9} />{g.room.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map(day => byDay[day.short].length > 0 && (
            <div key={day.short}>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold" style={{ color: day.short === todayShort ? 'var(--primary)' : 'var(--text)' }}>
                  {day.full}
                  {day.short === todayShort && <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary)', color: '#fff' }}>Bugun</span>}
                </h3>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="space-y-2">
                {byDay[day.short].map(g => (
                  <div key={g.id} className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                    <div className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: COLORS[g.colorIdx] }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: 'var(--text)' }}>{g.name}</p>
                      {g.course && <p className="text-xs" style={{ color: 'var(--text2)' }}>{g.course.name}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text2)' }}>
                      {g.teacher && (
                        <span className="hidden md:flex items-center gap-1">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'var(--primary)' }}>{g.teacher.name?.[0]}</div>
                          {g.teacher.name}
                        </span>
                      )}
                      {g.room && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />{g.room.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text)' }}>
                        <Clock size={13} />{g.start_time} — {g.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} />{g.student_count || 0}/{g.max_students}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
