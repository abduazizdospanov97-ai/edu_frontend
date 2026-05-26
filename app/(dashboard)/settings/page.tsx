'use client'
import { useState, useEffect } from 'react'
import { coursesApi, roomsApi, teachersApi } from '@/lib/api'
import { Plus, X, Loader2, BookOpen, DoorOpen, User, Save } from 'lucide-react'

export default function SettingsPage() {
  const [tab, setTab] = useState<'courses' | 'rooms' | 'teachers'>('courses')
  const [courses, setCourses] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)

  const [courseForm, setCourseForm] = useState({ name: '', duration: '6', price: '500000', color: '#3B82F6', description: '' })
  const [roomForm, setRoomForm] = useState({ name: '', capacity: '20', floor: '1', status: 'AVAILABLE' })
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', phone: '', salary: '3000000', subject: '' })

  const COLORS_PRESET = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']
  const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE']

  const loadData = async () => {
    setLoading(true)
    if (tab === 'courses') { const r = await coursesApi.list(); setCourses(r.data || []) }
    if (tab === 'rooms')   { const r = await roomsApi.list();   setRooms(r.data || []) }
    if (tab === 'teachers'){ const r = await teachersApi.list(); setTeachers(r.data || []) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [tab])

  const openCreateCourse = () => { setEditItem(null); setCourseForm({ name: '', duration: '6', price: '500000', color: '#3B82F6', description: '' }); setShowModal(true) }
  const openEditCourse = (c: any) => { setEditItem(c); setCourseForm({ name: c.name, duration: String(c.duration), price: String(c.price), color: c.color || '#3B82F6', description: c.description || '' }); setShowModal(true) }
  const openCreateRoom = () => { setEditItem(null); setRoomForm({ name: '', capacity: '20', floor: '1', status: 'AVAILABLE' }); setShowModal(true) }
  const openEditRoom = (r: any) => { setEditItem(r); setRoomForm({ name: r.name, capacity: String(r.capacity), floor: String(r.floor), status: r.status }); setShowModal(true) }
  const openCreateTeacher = () => { setEditItem(null); setTeacherForm({ name: '', email: '', password: '', phone: '', salary: '3000000', subject: '' }); setShowModal(true) }
  const openEditTeacher = (t: any) => { setEditItem(t); setTeacherForm({ name: t.name, email: t.email || '', password: '', phone: t.phone || '', salary: String(t.salary || 3000000), subject: t.subject || '' }); setShowModal(true) }

  const handleSaveCourse = async () => {
    setSaving(true)
    const payload = { name: courseForm.name, duration: parseInt(courseForm.duration), price: parseInt(courseForm.price), color: courseForm.color, description: courseForm.description }
    if (editItem) await coursesApi.update(editItem.id, payload)
    else await coursesApi.create(payload)
    setSaving(false); setShowModal(false); loadData()
  }

  const handleSaveRoom = async () => {
    setSaving(true)
    const payload = { name: roomForm.name, capacity: parseInt(roomForm.capacity), floor: parseInt(roomForm.floor), status: roomForm.status }
    if (editItem) await roomsApi.update(editItem.id, payload)
    else await roomsApi.create(payload)
    setSaving(false); setShowModal(false); loadData()
  }

  const handleSaveTeacher = async () => {
    setSaving(true)
    try {
      const salary = parseInt(teacherForm.salary) || 0
      const payload: any = {
        name: teacherForm.name.trim(),
        phone: teacherForm.phone,
        salary,
        subject: teacherForm.subject.trim(),
      }
      if (editItem) {
        await teachersApi.update(editItem.id, payload)
      } else {
        await teachersApi.create({ ...payload, email: teacherForm.email.trim(), password: teacherForm.password })
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    if (tab === 'courses')  await coursesApi.delete(id)
    if (tab === 'rooms')    await roomsApi.delete(id)
    if (tab === 'teachers') await teachersApi.delete(id)
    loadData()
  }

  const TABS = [
    { id: 'courses', label: 'Kurslar', icon: <BookOpen size={16} /> },
    { id: 'rooms', label: 'Xonalar', icon: <DoorOpen size={16} /> },
    { id: 'teachers', label: "O'qituvchilar", icon: <User size={16} /> },
  ]

  const ROOM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Bo\'sh', color: '#10B981' },
    OCCUPIED: { label: 'Band', color: '#F59E0B' },
    MAINTENANCE: { label: 'Ta\'mirda', color: '#EF4444' },
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Sozlamalar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>Kurslar, xonalar va o'qituvchilarni boshqarish</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl w-fit" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === t.id ? { background: 'var(--primary)', color: '#fff' } : { color: 'var(--text2)' }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <button
            onClick={tab === 'courses' ? openCreateCourse : tab === 'rooms' ? openCreateRoom : openCreateTeacher}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
            <Plus size={16} /> Yangi {tab === 'courses' ? 'kurs' : tab === 'rooms' ? 'xona' : "o'qituvchi"}
          </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <>
          {/* Courses */}
          {tab === 'courses' && (
            <div className="grid gap-3 md:grid-cols-2">
              {courses.map(c => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: c.color || '#3B82F6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{c.duration} oy • {new Intl.NumberFormat('uz-UZ').format(c.price)} so'm/oy</p>
                    {c.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{c.description}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditCourse(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Tahrir</button>
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rooms */}
          {tab === 'rooms' && (
            <div className="grid gap-3 md:grid-cols-2">
              {rooms.map(r => {
                const st = ROOM_STATUS_LABELS[r.status] || { label: r.status, color: '#888' }
                return (
                  <div key={r.id} className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg3)' }}>
                      <DoorOpen size={20} style={{ color: 'var(--text2)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold" style={{ color: 'var(--text)' }}>{r.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>{r.floor}-qavat • {r.capacity} joy</p>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold mt-1 inline-block"
                        style={{ background: `${st.color}20`, color: st.color }}>{st.label}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEditRoom(r)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Tahrir</button>
                      <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Teachers */}
          {tab === 'teachers' && (
            <div className="grid gap-3 md:grid-cols-2">
              {teachers.map((t: any) => (
                <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
                    {t.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold" style={{ color: 'var(--text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{t.subject} • {t.phone}</p>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{new Intl.NumberFormat('uz-UZ').format(t.salary)} so'm/oy</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditTeacher(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Tahrir</button>
                    <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>O'chirish</button>
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-sm col-span-2 text-center py-8" style={{ color: 'var(--text2)' }}>O'qituvchi topilmadi</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Course Modal */}
      {showModal && tab === 'courses' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{editItem ? 'Kursni tahrirlash' : 'Yangi kurs'}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Kurs nomi</label>
              <input value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Davomiyligi (oy)</label>
                <input type="number" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Narxi (so'm/oy)</label>
                <input type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text2)' }}>Rang</label>
              <div className="flex gap-2">
                {COLORS_PRESET.map(c => (
                  <button key={c} onClick={() => setCourseForm({ ...courseForm, color: c })}
                    className="w-8 h-8 rounded-xl transition-all"
                    style={{ background: c, outline: courseForm.color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Tavsif</label>
              <input value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="masalan: HTML, CSS, JavaScript, React"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <button onClick={handleSaveCourse} disabled={saving || !courseForm.name}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editItem ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showModal && tab === 'rooms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{editItem ? 'Xonani tahrirlash' : 'Yangi xona'}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Xona nomi</label>
              <input value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="masalan: 101-xona"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Sig'imi (joy)</label>
                <input type="number" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Qavat</label>
                <input type="number" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text2)' }}>Holat</label>
              <div className="flex gap-2">
                {ROOM_STATUSES.map(s => {
                  const st = ROOM_STATUS_LABELS[s] || { label: s, color: '#888' }
                  return (
                    <button key={s} onClick={() => setRoomForm({ ...roomForm, status: s })}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={roomForm.status === s ? { background: st.color, color: '#fff' } : { background: 'var(--bg3)', color: 'var(--text2)' }}>
                      {st.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <button onClick={handleSaveRoom} disabled={saving || !roomForm.name}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editItem ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </div>
      )}
      {/* Teacher Modal */}
      {showModal && tab === 'teachers' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{editItem ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Ism familiya</label>
                <input value={teacherForm.name} onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  placeholder="Ali Valiyev"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              {!editItem && <>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Email</label>
                  <input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    placeholder="teacher@example.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Parol</label>
                  <input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    placeholder="kamida 6 belgi"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </>}
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Telefon</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <span className="px-3 py-2.5 text-sm font-semibold flex-shrink-0 flex items-center"
                    style={{ background: 'var(--bg3)', color: 'var(--text2)', borderRight: '1px solid var(--border)' }}>
                    +998
                  </span>
                  <input
                    value={teacherForm.phone.replace(/^\+998/, '')}
                    onChange={e => setTeacherForm({ ...teacherForm, phone: '+998' + e.target.value.replace(/\D/g, '').slice(0, 9) })}
                    placeholder="901234567"
                    maxLength={9}
                    className="flex-1 px-3 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--bg3)', color: 'var(--text)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Maosh (so'm)</label>
                <input type="number" value={teacherForm.salary} onChange={e => setTeacherForm({ ...teacherForm, salary: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Fan / Ixtisoslik</label>
                <input value={teacherForm.subject} onChange={e => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                  placeholder="masalan: Frontend dasturlash"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
            <button onClick={handleSaveTeacher}
              disabled={saving || !teacherForm.name || (!editItem && (!teacherForm.email || !teacherForm.password))}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editItem ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
