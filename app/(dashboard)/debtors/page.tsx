'use client'
import { useState, useEffect } from 'react'
import { debtorsApi } from '@/lib/api'
import { AlertTriangle, Phone, Loader2, BellRing, CheckCircle } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n)

export default function DebtorsPage() {
  const [debtors, setDebtors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await debtorsApi.list()
    setDebtors(res.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === debtors.length) setSelected(new Set())
    else setSelected(new Set(debtors.map(d => d.id)))
  }

  const handleNotify = async () => {
    if (selected.size === 0) return
    setNotifying(true)
    await debtorsApi.notify(Array.from(selected))
    setNotifying(false)
    setNotified(true)
    setTimeout(() => setNotified(false), 3000)
  }

  const totalDebt = debtors.reduce((sum, d) => sum + d.debt, 0)

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Qarzdarlar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
            {debtors.length} ta qarzdor • Jami qarz: {fmt(totalDebt)} so'm
          </p>
        </div>
        {selected.size > 0 && (
          <button onClick={handleNotify} disabled={notifying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: notified ? '#10B981' : 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
            {notifying ? <Loader2 size={14} className="animate-spin" /> : notified ? <CheckCircle size={14} /> : <BellRing size={14} />}
            {notified ? "Yuborildi!" : `${selected.size} ga xabar`}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jami qarzdor', value: debtors.length + ' kishi', color: '#EF4444' },
          { label: 'Jami qarz', value: fmt(totalDebt) + " so'm", color: '#F59E0B' },
          { label: "O'rtacha qarz", value: debtors.length ? fmt(Math.round(totalDebt / debtors.length)) + " so'm" : '—', color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text2)' }}>{s.label}</p>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
          <input type="checkbox"
            checked={selected.size === debtors.length && debtors.length > 0}
            onChange={selectAll}
            className="w-4 h-4 rounded cursor-pointer" />
          <span className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>
            {selected.size > 0 ? `${selected.size} ta tanlandi` : 'Barchasi'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <>
            {debtors.map((d, i) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                         background: selected.has(d.id) ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)}
                  className="w-4 h-4 rounded cursor-pointer flex-shrink-0" />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                  {d.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{d.name}</p>
                  <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text2)' }}>
                    <Phone size={10} />{d.phone} • {d.group || d.course || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg" style={{ color: '#EF4444' }}>{fmt(d.debt)} so'm</p>
                  <p className="text-xs" style={{ color: 'var(--text2)' }}>qarz</p>
                </div>
                <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                </div>
              </div>
            ))}
            {debtors.length === 0 && (
              <div className="text-center py-16" style={{ color: 'var(--text2)' }}>
                <CheckCircle size={32} className="mx-auto mb-3" style={{ color: '#10B981' }} />
                <p className="font-semibold">Hech qanday qarzdor yo'q!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
