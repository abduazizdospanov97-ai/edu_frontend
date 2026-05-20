'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      if (res.data?.access) {
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login yoki parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>EduCRM</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Tizimga kirish</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 p-6 rounded-2xl"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text2)' }}>
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <button type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text2)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Kirish
          </button>
        </form>
      </div>
    </div>
  )
}
