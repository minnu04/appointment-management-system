import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MailPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  department: '',
  designation: '',
  employeeId: '',
  rollNo: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const extractErrorMessage = (error) => {
    const response = error.response?.data

    if (response?.errors?.length) {
      return response.errors[0].message
    }

    return response?.message || 'Unable to register'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await register(form)
      navigate('/verify', { state: { email: form.email } })
    } catch (error) {
      const message = extractErrorMessage(error)
      toast.error(message)

      if (message.toLowerCase().includes('already registered')) {
        navigate('/verify', { state: { email: form.email } })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-2xl rounded-[2rem] p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Register with your college email</h1>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Full name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">College email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="name@klu.ac.in"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              minLength={8}
              title="Password must be at least 8 characters"
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">Department</span>
            <input
              type="text"
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </label>

          {form.role === 'student' ? (
            <label>
              <span className="mb-2 block text-sm text-slate-300">Roll number</span>
              <input
                type="text"
                value={form.rollNo}
                onChange={(event) => setForm({ ...form, rollNo: event.target.value })}
                className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              />
            </label>
          ) : (
            <>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Designation</span>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(event) => setForm({ ...form, designation: event.target.value })}
                  className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm text-slate-300">Employee ID</span>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
                  className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                />
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="soft-ring md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <MailPlus className="h-4 w-4" /> {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-sky-300 hover:text-sky-200">Login</Link>
        </p>
      </div>
    </div>
  )
}