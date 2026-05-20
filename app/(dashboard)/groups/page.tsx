'use client'
import { useState, useEffect } from 'react'
import { groupsApi, coursesApi, teachersApi, roomsApi } from '@/lib/api'
import { Plus, Users, Clock, Calendar, X, Loader2, ChevronDown } from 'lucide-react'

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya']

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', course: '', teacher: '', room: '',
    start_time: '09:00', end_time: '11:00',
    days: [] as string[], max_students: '20'
  })

  const load = async () => {
    setLoading(true)
    const res = await groupsApi.list()
    setGroups(res.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    coursesApi.list().then(r => setCourses(r.data || []))
    teachersApi.list().then(r => setTeachers(r.data || []))
    roomsApi.list().then(r => setRooms(r.data || []))
  }, [])

  const openCreate = () => {
    setEditGroup(null)
    setForm({ name: '', course: '', teacher: '', room: '', start_time: '09:00', end_time: '11:00', days: [], max_students: '20' })
    setShowModal(true)
  }

  const openEdit = (g: any) => {
    setEditGroup(g)
    setForm({
      name: g.name,
      course: g.course?.id?.toString() || '',
      teacher: g.teacher?.id?.toString() || '',
      room: g.room?.id?.toString() || '',
      start_time: g.start_time || '09:00',
      end_time: g.end_time || '11:00',
      days: g.days || [],
      max_students: g.max_students?.toString() || '20',
    })
    setShowModal(true)
  }

  const toggleDay = (d: string) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: form.name,
      course: parseInt(form.course),
      teacher: parseInt(form.teacher),
      room: parseInt(form.room),
      start_time: form.start_time,
      end_time: form.end_time,
      days: form.days,
      max_students: parseInt(form.max_students),
    }
    if (editGroup) {
      await groupsApi.update(editGroup.id, payload)
    } else {
      await groupsApi.create(payload)
    }
    setSaving(false)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await groupsApi.delete(id)
    load()
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Guruhlar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{groups.length} ta guruh</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          <Plus size={16} /> Yangi guruh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(g => (
            <div key={g.id} className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>{g.name}</h3>
                  {g.course && (
                    <span className="text-xs px-2 py-0.5 rounded-lg font-medium mt-1 inline-block"
                      style={{ background: `${g.course.color}20`, color: g.course.color }}>
                      {g.course.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                  <Users size={12} />
                  {g.student_count || 0}/{g.max_students}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                {g.teacher && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text2)' }}>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'var(--primary)' }}>{g.teacher.name?.[0]}</div>
                    <span>{g.teacher.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ color: 'var(--text2)' }}>
                  <Clock size={14} />
                  <span>{g.start_time} — {g.end_time}</span>
                  {g.room && <span>• {g.room.name}</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(g.days || []).map((d: string) => (
                    <span key={d} className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(79,142,247,0.15)', color: 'var(--primary)' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((g.student_count || 0) / (g.max_students || 1)) * 100)}%`, background: 'var(--primary)' }} />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(g)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Tahrir</button>
                <button onClick={() => handleDelete(g.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                {editGroup ? 'Guruhni tahrirlash' : 'Yangi guruh'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Guruh nomi</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Kurs', key: 'course', options: courses },
                { label: "O'qituvchi", key: 'teacher', options: teachers.map((t: any) => ({ id: t.id, name: t.name })) },
                { label: 'Xona', key: 'room', options: rooms },
              ].map(f => (
                <div key={f.key} className={f.key === 'room' ? 'col-span-2' : ''}>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>{f.label}</label>
                  <select value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="">Tanlang</option>
                    {f.options.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Boshlanish</label>
                <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Tugash</label>
                <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Max o'quvchi</label>
                <input type="number" value={form.max_students} onChange={e => setForm({ ...form, max_students: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text2)' }}>Dars kunlari</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={form.days.includes(d)
                      ? { background: 'var(--primary)', color: '#fff' }
                      : { background: 'var(--bg3)', color: 'var(--text2)' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {editGroup ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
