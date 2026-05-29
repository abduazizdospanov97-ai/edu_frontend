'use client'
import { useState, useEffect } from 'react'
import { groupsApi } from '@/lib/api'
import { Loader2, Clock, MapPin, Users } from 'lucide-react'

const DAYS = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sha', full: 'Shanba' },
  { short: 'Ya', full: 'Yakshanba' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316']

export default function SchedulePage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'week' | 'list'>('week')
  const [selectedDay, setSelectedDay] = useState<string>('all')

  useEffect(() => {
    groupsApi.list().then(r => {
      setGroups(r.data || [])
      setLoading(false)
    })
  }, [])

  const byDay: Record<string, any[]> = {}
  DAYS.forEach(d => { byDay[d.short] = [] })
  groups.forEach((g, idx) => {
    (g.days || []).forEach((day: string) => {
      if (byDay[day]) byDay[day].push({ ...g, colorIdx: idx % COLORS.length })
    })
  })

  const today = new Date()
  const todayShort = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'][today.getDay()]

  const visibleDays = selectedDay === 'all'
    ? DAYS
    : DAYS.filter(d => d.short === selectedDay)

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

      {/* Day filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSelectedDay('all')}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={selectedDay === 'all'
            ? { background: 'var(--primary)', color: '#fff' }
            : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
          Hammasi
        </button>
        {DAYS.map(d => {
          const count = byDay[d.short].length
          const isActive = selectedDay === d.short
          const isToday = d.short === todayShort
          const isYa = d.short === 'Ya'
          return (
            <button key={d.short} onClick={() => setSelectedDay(d.short)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={isActive
                ? { background: 'var(--primary)', color: '#fff' }
                : isYa
                ? { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
                : isToday
                ? { background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }
                : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
              {d.full}
              {!isYa && (
                <span className="text-xs px-1.5 py-0.5 rounded-md"
                  style={isActive
                    ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { background: 'var(--bg3)', color: 'var(--text2)' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : view === 'week' ? (
        <div className={selectedDay === 'all'
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"}>
          {visibleDays.map(day => (
            <div key={day.short} className="min-h-64">
              <div className="text-center py-2 rounded-xl mb-2 text-sm font-bold"
                style={day.short === 'Ya'
                  ? { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
                  : day.short === todayShort
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                <p className="text-xs opacity-70 hidden sm:block">{day.full}</p>
                <p>{day.short}</p>
              </div>
              <div className="space-y-2">
                {day.short === 'Ya' ? (
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
                    <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Dam olish kuni</p>
                  </div>
                ) : byDay[day.short].length === 0 ? (
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'var(--bg3)', border: '1px dashed var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>Dars yo'q</p>
                  </div>
                ) : byDay[day.short].map(g => (
                  <div key={g.id} className="p-3 rounded-xl"
                    style={{ background: `${COLORS[g.colorIdx]}18`, border: `1px solid ${COLORS[g.colorIdx]}30` }}>
                    <p className="font-bold text-sm truncate" style={{ color: COLORS[g.colorIdx] }}>{g.name}</p>
                    {g.course && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{g.course.name}</p>
                    )}
                    <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: 'var(--text2)' }}>
                      <Clock size={11} />{g.start_time}–{g.end_time}
                    </p>
                    {g.room && (
                      <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text2)' }}>
                        <MapPin size={11} />{g.room.name}
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
          {visibleDays.map(day => (
            <div key={day.short}>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold" style={{ color: day.short === todayShort ? 'var(--primary)' : 'var(--text)' }}>
                  {day.full}
                  {day.short === todayShort && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--primary)', color: '#fff' }}>Bugun</span>
                  )}
                  {day.short === 'Ya' && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#f1f5f9', color: '#94a3b8' }}>Dam olish</span>
                  )}
                </h3>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="space-y-2">
                {day.short === 'Ya' || byDay[day.short].length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text2)' }}>
                    {day.short === 'Ya' ? 'Dam olish kuni' : "Dars yo'q"}
                  </p>
                ) : byDay[day.short].map(g => (
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
