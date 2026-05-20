'use client'
import { useState, useEffect } from 'react'
import { testsApi, groupsApi } from '@/lib/api'
import { Plus, X, Loader2, FileText, Users, Trophy, ChevronDown } from 'lucide-react'

export default function TestsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showResults, setShowResults] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', group: '', total_questions: '20', max_score: '100' })

  const load = async () => {
    setLoading(true)
    const res = await testsApi.list()
    setTests(res.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    groupsApi.list().then(r => setGroups(r.data || []))
  }, [])

  const openResults = async (test: any) => {
    setShowResults(test)
    const res = await testsApi.results(test.id)
    setResults(res.data || [])
  }

  const handleCreate = async () => {
    setSaving(true)
    await testsApi.create({
      title: form.title,
      group: form.group ? parseInt(form.group) : null,
      total_questions: parseInt(form.total_questions),
      max_score: parseInt(form.max_score),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ title: '', group: '', total_questions: '20', max_score: '100' })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await testsApi.delete(id)
    load()
  }

  const getGrade = (score: number, max: number) => {
    const pct = (score / max) * 100
    if (pct >= 90) return { label: 'A', color: '#10B981' }
    if (pct >= 75) return { label: 'B', color: '#3B82F6' }
    if (pct >= 60) return { label: 'C', color: '#F59E0B' }
    return { label: 'D', color: '#EF4444' }
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Testlar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>{tests.length} ta test</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          <Plus size={16} /> Yangi test
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map(t => (
            <div key={t.id} className="rounded-2xl p-5 space-y-4"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(79,142,247,0.15)' }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" style={{ color: 'var(--text)' }}>{t.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                    {t.group_name || 'Barcha guruhlar'} • {t.total_questions} ta savol
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Topshirdi', value: t.result_count || 0, icon: <Users size={12} /> },
                  { label: "O'rtacha", value: `${t.avg_score || 0}`, icon: <Trophy size={12} /> },
                  { label: 'Max ball', value: t.max_score, icon: <Trophy size={12} /> },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2.5 text-center"
                    style={{ background: 'var(--bg3)' }}>
                    <div className="flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--text2)' }}>
                      {s.icon}<span className="text-xs">{s.label}</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => openResults(t)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(79,142,247,0.15)', color: 'var(--primary)' }}>
                  Natijalar
                </button>
                <button onClick={() => handleDelete(t.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                  O'chirish
                </button>
              </div>
            </div>
          ))}
          {tests.length === 0 && (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--text2)' }}>Test topilmadi</div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Yangi test</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Test nomi</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="masalan: Frontend 1-oraliq test"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Guruh (ixtiyoriy)</label>
              <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                <option value="">Barcha guruhlar</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Savollar soni</label>
                <input type="number" value={form.total_questions}
                  onChange={e => setForm({ ...form, total_questions: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text2)' }}>Max ball</label>
                <input type="number" value={form.max_score}
                  onChange={e => setForm({ ...form, max_score: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>

            <button onClick={handleCreate} disabled={saving || !form.title}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Yaratish
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowResults(null)}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[80vh] flex flex-col"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{showResults.title} — Natijalar</h3>
              <button onClick={() => setShowResults(null)} style={{ color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto space-y-2">
              {results.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text2)' }}>Hali natija yo'q</p>
              ) : results.map((r, i) => {
                const grade = getGrade(r.score, showResults.max_score)
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--bg3)' }}>
                    <span className="text-sm font-bold w-6 text-right flex-shrink-0" style={{ color: 'var(--text2)' }}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.student_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ background: 'var(--bg2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(r.score / showResults.max_score) * 100}%`, background: grade.color }} />
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{r.score}/{showResults.max_score}</span>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: grade.color }}>{grade.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
