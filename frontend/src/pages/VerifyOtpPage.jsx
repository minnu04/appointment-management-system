import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { KeyRound, RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, resendOtp } = useAuth()
  const [form, setForm] = useState({ email: location.state?.email || '', otp: '' })
  const [loading, setLoading] = useState(false)

  const handleVerify = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { user } = await verifyOtp(form)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!form.email) {
      toast.error('Add your email first')
      return
    }

    try {
      await resendOtp({ email: form.email })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to resend OTP')
    }
  }

  return (
    <div className="page-enter flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Verify email</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Enter the OTP sent to your inbox</h1>
        </div>

        <form className="space-y-4" onSubmit={handleVerify}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">OTP</span>
            <input
              type="text"
              value={form.otp}
              onChange={(event) => setForm({ ...form, otp: event.target.value })}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none tracking-[0.35em]"
              placeholder="123456"
              maxLength={6}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="soft-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <KeyRound className="h-4 w-4" /> {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="mt-4 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
        >
          <RotateCcw className="h-4 w-4" /> Resend OTP
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-sky-300 hover:text-sky-200">Back to login</Link>
        </p>
      </div>
    </div>
  )
}