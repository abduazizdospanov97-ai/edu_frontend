'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck,
  DollarSign, AlertCircle, FileText, Calendar, Settings,
  LogOut, GraduationCap, Menu, X,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/students',   label: 'Studentlar',      icon: Users },
  { href: '/groups',     label: 'Guruhlar',        icon: BookOpen },
  { href: '/attendance', label: 'Davomat',         icon: CalendarCheck },
  { href: '/finance',    label: 'Moliya',          icon: DollarSign },
  { href: '/debtors',    label: 'Qarzdorlar',      icon: AlertCircle },
  { href: '/tests',      label: 'Testlar',         icon: FileText },
  { href: '/schedule',   label: 'Jadval',          icon: Calendar },
  { href: '/settings',   label: 'Sozlamalar',      icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full"
      style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', width: '220px', minWidth: '220px' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
          <GraduationCap size={18} color="white" />
        </div>
        <span className="font-black text-base" style={{ color: 'var(--text)' }}>EduCRM</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: 'rgba(79,142,247,0.15)', color: 'var(--primary)' }
                : { color: 'var(--text2)' }}>
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: 'var(--bg3)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))' }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'Foydalanuvchi'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>{user?.role || 'ADMIN'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
          style={{ color: 'var(--danger)' }}>
          <LogOut size={14} /> Chiqish
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)} />
          <div className="flex flex-col h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3"
          style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ color: 'var(--text2)' }}>
            <Menu size={22} />
          </button>
          <span className="font-black" style={{ color: 'var(--text)' }}>EduCRM</span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
