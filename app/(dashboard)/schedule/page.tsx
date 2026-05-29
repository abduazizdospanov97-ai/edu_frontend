'use client'
import { useState, useEffect } from 'react'
import { groupsApi } from '@/lib/api'
import { Loader2, Clock, MapPin, Users, X, User } from 'lucide-react'

const DAYS = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sha', full: 'Shanba' },
  { short: 'Ya', full: 'Yakshanba' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#F97316', '#EC4899']

const fmtTime = (t: string) => t ? t.slice(0, 5) : ''

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
  Object.keys(byDay).forEach(k => {
    byDay[k].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  })

  const today = new Date()
  const todayShort = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha'][today.getDay()]

  const visibleDays = selectedDay === 'all'
    ? DAYS
    : DAYS.filter(d => d.short === selectedDay)

  const handleDayClick = (day: string) => {
    setSelectedDay(prev => prev === day ? 'all' : day)
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Dars jadvali</h1>
          <p className="text-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--text2)' }}>
            {groups.length} ta guruh
            {selectedDay !== 'all' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
                style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--primary)' }}>
                {DAYS.find(d => d.short === selectedDay)?.full}
                <button onClick={() => setSelectedDay('all')}><X size={11} /></button>
              </span>
            )}
          </p>
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
        <div className={selectedDay === 'all'
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
          {visibleDays.map(day => {
            const isActive = selectedDay === day.short
            const isToday = day.short === todayShort
            const isYa = day.short === 'Ya'
            const count = byDay[day.short].length
            return (
              <div key={day.short} className="space-y-2">
                <button
                  onClick={() => handleDayClick(day.short)}
                  disabled={isYa}
                  className="w-full py-3 px-3 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed"
                  style={isActive
                    ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }
                    : isYa
                    ? { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
                    : isToday
                    ? { background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }
                    : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{day.full}</span>
                    {!isYa && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                        style={isActive
                          ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                          : { background: 'var(--bg3)', color: 'var(--text2)' }}>
                        {count}
                      </span>
                    )}
                  </div>
                </button>
                <div className="space-y-2">
                  {isYa ? (
                    <div className="p-4 rounded-xl text-center"
                      style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
                      <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Dam olish kuni</p>
                    </div>
                  ) : count === 0 ? (
                    <div className="p-3 rounded-xl text-center"
                      style={{ background: 'var(--bg3)', border: '1px dashed var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>Dars yo'q</p>
                    </div>
                  ) : byDay[day.short].map(g => (
                    <div key={g.id} className="p-3 rounded-xl space-y-1.5 transition-all hover:shadow-sm"
                      style={{ background: '#ffffff', border: `1px solid ${COLORS[g.colorIdx]}40`, borderLeft: `3px solid ${COLORS[g.colorIdx]}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm" style={{ color: COLORS[g.colorIdx] }}>{g.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                          style={{ background: `${COLORS[g.colorIdx]}15`, color: COLORS[g.colorIdx] }}>
                          {fmtTime(g.start_time)}
                        </span>
                      </div>
                      {g.course && (
                        <p className="text-xs truncate" style={{ color: 'var(--text)' }}>{g.course.name}</p>
                      )}
                      <div className="space-y-0.5 pt-1" style={{ borderTop: '1px dashed var(--border)' }}>
                        <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text2)' }}>
                          <Clock size={10} />{fmtTime(g.start_time)}–{fmtTime(g.end_time)}
                        </p>
                        {g.room && (
                          <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text2)' }}>
                            <MapPin size={10} />{g.room.name}
                          </p>
                        )}
                        {g.teacher && (
                          <p className="flex items-center gap-1 text-xs truncate" style={{ color: 'var(--text2)' }}>
                            <User size={10} />{g.teacher.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleDays.map(day => {
            const isYa = day.short === 'Ya'
            const isToday = day.short === todayShort
            return (
              <div key={day.short}>
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => handleDayClick(day.short)} disabled={isYa}
                    className="font-bold transition-colors disabled:cursor-not-allowed"
                    style={{ color: isYa ? '#94a3b8' : isToday ? 'var(--primary)' : 'var(--text)' }}>
                    {day.full}
                    {isToday && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--primary)', color: '#fff' }}>Bugun</span>
                    )}
                    {isYa && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#f1f5f9', color: '#94a3b8' }}>Dam olish</span>
                    )}
                  </button>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <div className="space-y-2">
                  {isYa || byDay[day.short].length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--text2)' }}>
                      {isYa ? 'Dam olish kuni' : "Dars yo'q"}
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
                          <Clock size={13} />{fmtTime(g.start_time)} — {fmtTime(g.end_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} />{g.student_count || 0}/{g.max_students}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
