import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="page-enter relative overflow-hidden">
      <div className="orb orb-one absolute -left-10 top-20" />
      <div className="orb orb-two absolute right-0 top-10" />

      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-200">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            College Appointment Management System
          </div>
          <h1 className="section-title mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Schedule faculty meetings without the queue.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            A modern platform for college appointment management with clean slot control.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="soft-ring inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:opacity-90"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="soft-ring inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Login
            </Link>
          </div>

        </div>

        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="glass-panel rounded-3xl p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Slot control</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Faculty define the next four days of availability with conflict protection built in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}