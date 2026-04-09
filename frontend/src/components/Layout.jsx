import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, LogOut, Shield, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-2 rounded-full px-4 py-2 text-sm transition',
    isActive ? 'bg-sky-400/15 text-sky-200' : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

export function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">CampusFlow</p>
              <h1 className="text-sm font-semibold text-white">Appointment Management</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            {user?.role === 'student' && (
              <NavLink to="/book" className={navClass}>
                <CalendarDays className="h-4 w-4" /> Book Slot
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass}>
                <Shield className="h-4 w-4" /> Admin Panel
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:flex">
              <UserRound className="mr-2 h-4 w-4 text-sky-300" />
              {user?.name} · {user?.role}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="soft-ring inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}