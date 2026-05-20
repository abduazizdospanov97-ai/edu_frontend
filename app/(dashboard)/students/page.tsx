'use client'
import { useState, useEffect } from 'react'
import { studentsApi, groupsApi, coursesApi } from '@/lib/api'
import { Plus, Search, Phone, MapPin, X, ChevronDown, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string
  birth_date: string
  address: string
  course: { id: number; name: string; color: string } | null
  group: number | null
  group_name: string | null
  balance: number
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981',
  INACTIVE: '#6B7280',
  GRADUATED: '#3B82F6',
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '',
    birth_date: '', address: '', course: '', group: '', status: 'ACTIVE'
  })

  const load = async () => {
    setLoading(true)
    const params: any = {}
    if (search) params.search = search
    if (filterGroup) params.group = filterGroup
    const res = await studentsApi.list(params)
    setStudents(res.data || [])
    setLoading(false)
  }

  useEffect(() => {
    groupsApi.list().then(r => setGroups(r.data || []))
    coursesApi.list().then(r => setCourses(r.data || []))
  }, [])

  useEffect(() => { load() }, [search, filterGroup])

  const openCreate = () => {
    setEditStudent(null)
    setForm({ first_name: '', last_name: '', phone: '', birth_date: '', address: '', course: '', group: '', status: 'ACTIVE' })
    setShowModal(true)
  }

  const openEdit = (s: Student) => {
    setEditStudent(s)
    setForm({
      first_name: s.first_name, last_name: s.last_name, phone: s.phone,
      birth_date: s.birth_date || '', address: s.address,
      course: s.course?.id?.toString() || '',
      group: s.group?.toString() || '',
      status: s.status,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload: any = { ...form }
    if (payload.course) payload.course = parseInt(payload.course)
    if (payload.group) payload.group = parseInt(payload.group)
    if (!payload.birth_date) delete payload.birth_date
    if (editStudent) {
      await studentsApi.update(editStudent.id, payload)
    } else {
      await studentsApi.create(payload)
    }
    setSaving(false)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await studentsApi.delete(id)
    load()
  }

  const formatBalance = (b: number) => {
    if (b === 0) return <span style={{ color: 'var(--text2)' }}>—</span>
    if (b < 0) return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{(b / 1000).toFixed(0)}K</span>
    return <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{(b / 1000).toFixed(0)}K</span>
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Studentlar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{students.length} ta student</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          <Plus size={16} /> Yangi student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki telefon..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>
        <div className="relative">
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Barcha guruhlar</option>
            {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text2)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Ism', 'Telefon', 'Guruh', 'Kurs', 'Balans', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: 'var(--text2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                  className="transition-colors hover:bg-white/3">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: s.course?.color || 'var(--primary)' }}>
                        {s.first_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text)' }}>{s.full_name}</p>
                        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text2)' }}>
                          <MapPin size={10} />{s.address || '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text2)' }}>
                      <Phone size={12} />{s.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ color: 'var(--text)' }}>{s.group_name || '—'}</td>
                  <td className="px-5 py-3">
                    {s.course ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${s.course.color}20`, color: s.course.color }}>
                        {s.course.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3">{formatBalance(s.balance)}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: `${STATUS_COLORS[s.status] || '#888'}20`, color: STATUS_COLORS[s.status] || '#888' }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/students/${s.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        style={{ background: 'rgba(79,142,247,0.1)', color: 'var(--primary)' }}>
                        <ExternalLink size={11} /> Profil
                      </Link>
                      <button onClick={() => openEdit(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Tahrir</button>
                      <button onClick={() => handleDelete(s.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16" style={{ color: 'var(--text2)' }}>Student topilmadi</td></tr>
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
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                {editStudent ? 'Tahrirlash' : 'Yangi student'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ism', key: 'first_name', type: 'text' },
                { label: 'Familiya', key: 'last_name', type: 'text' },
                { label: "Tug'ilgan sana", key: 'birth_date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Telefon</label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <span className="px-3 py-2 text-sm font-semibold flex-shrink-0 flex items-center"
                  style={{ background: 'var(--bg3)', color: 'var(--text2)', borderRight: '1px solid var(--border)' }}>
                  +998
                </span>
                <input
                  value={form.phone.replace(/^\+998/, '')}
                  onChange={e => setForm({ ...form, phone: '+998' + e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="901234567"
                  maxLength={9}
                  className="flex-1 px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--bg3)', color: 'var(--text)' }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Manzil</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Kurs</label>
                <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Tanlang</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Guruh</label>
                <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Tanlang</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {editStudent ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
