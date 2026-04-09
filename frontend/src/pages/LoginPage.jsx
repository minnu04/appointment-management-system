import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { user } = await login(form)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Login to continue</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">College email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500"
              placeholder="name@college.edu"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500"
              placeholder="Minimum 8 characters"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="soft-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" /> {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New here? <Link to="/register" className="text-sky-300 hover:text-sky-200">Create an account</Link>
        </p>
      </div>
    </div>
  )
}