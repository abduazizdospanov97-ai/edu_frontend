'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { studentsApi } from '@/lib/api'
import {
  ArrowLeft, Phone, MapPin, Calendar, BookOpen, Users,
  DollarSign, CheckCircle, XCircle, Clock, Loader2,
} from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n)
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('uz-UZ') : '—'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Faol',     color: '#10B981' },
  INACTIVE:  { label: 'Nofaol',  color: '#6B7280' },
  GRADUATED: { label: 'Bitirgan', color: '#3B82F6' },
}

const ATT_ICONS: Record<string, any> = {
  PRESENT: <CheckCircle size={14} color="#10B981" />,
  ABSENT:  <XCircle size={14} color="#ef4444" />,
  LATE:    <Clock size={14} color="#f59e0b" />,
}
const ATT_LABELS: Record<string, string> = {
  PRESENT: 'Keldi', ABSENT: 'Kelmadi', LATE: 'Kech keldi',
}
const ATT_COLORS: Record<string, string> = {
  PRESENT: '#10B981', ABSENT: '#ef4444', LATE: '#f59e0b',
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma",
}
const METHOD_COLORS: Record<string, string> = {
  CASH: '#10B981', CARD: '#3B82F6', TRANSFER: '#F59E0B',
}

export default function StudentProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'payments' | 'attendance'>('payments')

  useEffect(() => {
    if (!id) return
    const studentId = parseInt(id as string)
    Promise.all([
      studentsApi.get(studentId),
      studentsApi.payments(studentId),
      studentsApi.attendance(studentId),
    ]).then(([sRes, pRes, aRes]) => {
      setStudent(sRes.data)
      setPayments(pRes.data || [])
      setAttendance(aRes.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-32" style={{ color: 'var(--text2)' }}>
        Student topilmadi
      </div>
    )
  }

  const status = STATUS_LABELS[student.status] || { label: student.status, color: '#888' }
  const attPresent = attendance.filter(a => a.status === 'PRESENT').length
  const attPct = attendance.length ? Math.round(attPresent / attendance.length * 100) : 0
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
        style={{ color: 'var(--text2)' }}>
        <ArrowLeft size={16} /> Orqaga
      </button>

      {/* Header card */}
      <div className="p-6 rounded-2xl flex items-start gap-5"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
          style={{ background: student.course?.color || 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          {student.first_name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>{student.full_name}</h1>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: `${status.color}20`, color: status.color }}>
              {status.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text2)' }}>
            {student.phone && (
              <span className="flex items-center gap-1.5"><Phone size={13} />{student.phone}</span>
            )}
            {student.address && (
              <span className="flex items-center gap-1.5"><MapPin size={13} />{student.address}</span>
            )}
            {student.birth_date && (
              <span className="flex items-center gap-1.5"><Calendar size={13} />{fmtDate(student.birth_date)}</span>
            )}
            {student.course && (
              <span className="flex items-center gap-1.5"><BookOpen size={13} />{student.course.name}</span>
            )}
            {student.group_name && (
              <span className="flex items-center gap-1.5"><Users size={13} />{student.group_name}</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs mb-1" style={{ color: 'var(--text2)' }}>Balans</p>
          <p className="text-xl font-black"
            style={{ color: student.balance < 0 ? 'var(--danger)' : student.balance > 0 ? 'var(--success)' : 'var(--text2)' }}>
            {student.balance > 0 ? '+' : ''}{fmt(student.balance)} so'm
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami to'lov", value: `${fmt(totalPaid)} so'm`, icon: <DollarSign size={18} />, color: '#10B981' },
          { label: "Davomat", value: `${attPct}%`, icon: <CheckCircle size={18} />, color: '#3B82F6' },
          { label: "Darslar soni", value: attendance.length, icon: <Calendar size={18} />, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--text2)' }}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-lg font-black" style={{ color: 'var(--text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl w-fit"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {([['payments', "To'lovlar"], ['attendance', 'Davomat']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === key ? { background: 'var(--primary)', color: '#fff' } : { color: 'var(--text2)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Payments table */}
      {tab === 'payments' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Sana', 'Miqdor', "To'lov turi", 'Izoh'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{fmtDate(p.created_at)}</td>
                  <td className="px-5 py-3 font-bold" style={{ color: '#10B981' }}>+{fmt(p.amount)} so'm</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${METHOD_COLORS[p.method] || '#888'}20`, color: METHOD_COLORS[p.method] || '#888' }}>
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{p.note || '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12" style={{ color: 'var(--text2)' }}>To'lovlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendance table */}
      {tab === 'attendance' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Sana', 'Holat'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-5 py-3" style={{ color: 'var(--text2)' }}>{fmtDate(a.date)}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 text-xs font-semibold w-fit px-2.5 py-1 rounded-lg"
                      style={{ background: `${ATT_COLORS[a.status] || '#888'}20`, color: ATT_COLORS[a.status] || '#888' }}>
                      {ATT_ICONS[a.status]} {ATT_LABELS[a.status] || a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={2} className="text-center py-12" style={{ color: 'var(--text2)' }}>Davomat topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
