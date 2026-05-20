'use client'
import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'

const fmt = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return String(n)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [revenue, setRevenue] = useState<any[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [statsRes, revRes, payRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.revenue('week'),
        dashboardApi.recentPayments(),
      ])
      setStats(statsRes.data || {})
      setRevenue(revRes.data || [])
      setRecentPayments(payRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const loadRevenue = async (period: 'week' | 'month') => {
    setActiveTab(period)
    const res = await dashboardApi.revenue(period)
    setRevenue(res.data || [])
  }

  const maxRev = revenue.length ? Math.max(...revenue.map(d => d.amount), 1) : 1

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Hozirgina'
    if (m < 60) return `${m} daqiqa oldin`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} soat oldin`
    return `${Math.floor(h / 24)} kun oldin`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-80">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const statCards = [
    { icon: '👨‍🎓', value: stats?.total_students ?? '—', label: 'Jami studentlar', color: 'primary' },
    { icon: '👥', value: stats?.total_groups ?? '—', label: 'Aktiv guruhlar', color: 'success' },
    { icon: '💰', value: fmt(stats?.today_income ?? 0), label: 'Bugungi daromad', color: 'warning' },
    { icon: '⚠️', value: stats?.total_debtors ?? '—', label: 'Qarzdarlar', color: 'danger' },
  ]

  const colorMap: Record<string, string> = {
    primary: 'var(--primary)', success: 'var(--success)',
    warning: 'var(--warning)', danger: 'var(--danger)'
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="rounded-2xl p-5"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="text-2xl mb-3">{c.icon}</div>
            <p className="text-2xl font-black" style={{ color: colorMap[c.color] }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>Daromad tahlili</h3>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
              {(['week', 'month'] as const).map(t => (
                <button key={t} onClick={() => loadRevenue(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={activeTab === t
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { color: 'var(--text2)', background: 'transparent' }}>
                  {t === 'week' ? 'Hafta' : 'Oy'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {revenue.map(d => (
              <div key={d.date || d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t-lg transition-all duration-500 relative group"
                  style={{ height: `${(d.amount / maxRev) * 130}px`, minHeight: '4px', background: 'linear-gradient(to top, #3b7de8, #4f8ef7)' }}>
                  {d.amount > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                      {fmt(d.amount)}
                    </div>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--text2)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>Bugungi davomat</h3>
            <div className="flex gap-3 text-sm">
              <span style={{ color: 'var(--success)' }}>✅ {stats?.attendance?.present || 0} keldi</span>
              <span style={{ color: 'var(--danger)' }}>❌ {stats?.attendance?.total - stats?.attendance?.present || 0} kelmadi</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg3)" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#3B82F6" strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (stats?.attendance?.percentage || 0) / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black" style={{ color: 'var(--text)' }}>{stats?.attendance?.percentage || 0}%</span>
                <span className="text-xs" style={{ color: 'var(--text2)' }}>davomat</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text2)' }}>Jami</p>
                <p className="font-bold" style={{ color: 'var(--text)' }}>{stats?.attendance?.total || 0} ta dars</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text2)' }}>Keldi</p>
                <p className="font-bold" style={{ color: 'var(--success)' }}>{stats?.attendance?.present || 0} ta student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold" style={{ color: 'var(--text)' }}>So'nggi to'lovlar</h3>
          <Link href="/finance" className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: 'var(--primary)' }}>
            Barchasi <ArrowRight size={12} />
          </Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text2)' }}>To'lovlar topilmadi</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', color: '#fff' }}>
                  {p.studentName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{p.studentName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>{p.courseName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--success)' }}>+{fmt(p.amount)}</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>{timeAgo(p.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
