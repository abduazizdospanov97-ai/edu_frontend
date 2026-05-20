'use client'
import { useState, useEffect } from 'react'
import { paymentsApi, studentsApi } from '@/lib/api'
import { Plus, X, Loader2, TrendingUp, DollarSign, Calendar, CreditCard } from 'lucide-react'

const METHODS = ['CASH', 'CARD', 'TRANSFER']
const METHOD_LABELS: Record<string, string> = { CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma" }
const METHOD_COLORS: Record<string, string> = { CASH: '#10B981', CARD: '#3B82F6', TRANSFER: '#F59E0B' }

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n)

export default function FinancePage() {
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterMethod, setFilterMethod] = useState('')
  const [form, setForm] = useState({ student: '', amount: '', method: 'CASH', note: '' })

  const load = async () => {
    setLoading(true)
    const params: any = {}
    if (filterMethod) params.method = filterMethod
    const [pRes, sRes] = await Promise.all([
      paymentsApi.list(params),
      paymentsApi.summary()
    ])
    setPayments(pRes.data || [])
    setSummary(sRes.data || {})
    setLoading(false)
  }

  useEffect(() => { load() }, [filterMethod])
  useEffect(() => {
    studentsApi.list().then(r => setStudents(r.data || []))
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    await paymentsApi.create({
      student: parseInt(form.student),
      amount: parseInt(form.amount),
      method: form.method,
      note: form.note,
      status: 'PAID',
    })
    setSaving(false)
    setShowModal(false)
    setForm({ student: '', amount: '', method: 'CASH', note: '' })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await paymentsApi.delete(id)
    load()
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Moliya</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>To'lovlar va daromad tahlili</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          <Plus size={16} /> Yangi to'lov
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bugun', value: summary.today || 0, icon: <Calendar size={18} />, color: '#3B82F6' },
          { label: 'Bu hafta', value: summary.week || 0, icon: <TrendingUp size={18} />, color: '#10B981' },
          { label: 'Bu oy', value: summary.month || 0, icon: <CreditCard size={18} />, color: '#F59E0B' },
          { label: 'Jami', value: summary.total || 0, icon: <DollarSign size={18} />, color: '#8B5CF6' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--text2)' }}>{card.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}20`, color: card.color }}>{card.icon}</div>
            </div>
            <p className="text-xl font-black" style={{ color: 'var(--text)' }}>{fmt(card.value)} so'm</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilterMethod('')}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={!filterMethod ? { background: 'var(--primary)', color: '#fff' } : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
          Barchasi
        </button>
        {METHODS.map(m => (
          <button key={m} onClick={() => setFilterMethod(m)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={filterMethod === m ? { background: METHOD_COLORS[m], color: '#fff' } : { background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Student', 'Kurs', 'Miqdor', "To'lov turi", 'Sana', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'var(--primary)' }}>
                        {p.student_name?.[0]}
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>{p.student_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{p.course_name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-bold" style={{ color: '#10B981' }}>+{fmt(p.amount)} so'm</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${METHOD_COLORS[p.method] || '#888'}20`, color: METHOD_COLORS[p.method] || '#888' }}>
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="text-center py-16" style={{ color: 'var(--text2)' }}>To'lovlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Yangi to'lov</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Student</label>
              <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                <option value="">Tanlang</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Miqdor (so'm)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="500000"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text2)' }}>To'lov turi</label>
              <div className="flex gap-2">
                {METHODS.map(m => (
                  <button key={m} onClick={() => setForm({ ...form, method: m })}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={form.method === m
                      ? { background: METHOD_COLORS[m], color: '#fff' }
                      : { background: 'var(--bg3)', color: 'var(--text2)' }}>
                    {METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Izoh (ixtiyoriy)</label>
              <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <button onClick={handleCreate} disabled={saving || !form.student || !form.amount}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
