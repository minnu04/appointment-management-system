import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { CalendarCheck2, CalendarClock, CheckCircle2, ClipboardList, PlusCircle, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { appointmentsApi, dashboardApi, slotsApi } from '../services/api.js'
import { StatCard } from '../components/StatCard.jsx'

const formatDateTime = (date, time) => format(parseISO(`${date}T${time}:00`), 'PPpp')

function AppointmentList({ title, items }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No records yet.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{item.facultyId?.name || item.studentId?.name}</p>
                  <p className="text-sm text-slate-400">{formatDateTime(item.date, item.time)}</p>
                </div>
                <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{item.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function FacultySlotCreator({ onCreated }) {
  const [draft, setDraft] = useState({ date: '', time: '' })
  const [batch, setBatch] = useState([])

  const addSlot = () => {
    if (!draft.date || !draft.time) {
      toast.error('Choose a date and time')
      return
    }

    setBatch((current) => [...current, draft])
    setDraft({ date: '', time: '' })
  }

  const submitSlots = async () => {
    if (batch.length === 0) {
      toast.error('Add at least one slot')
      return
    }

    await onCreated(batch)
    setBatch([])
  }

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Create slots</h3>
        <span className="text-sm text-slate-400">Next 4 days only</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="date"
          value={draft.date}
          onChange={(event) => setDraft({ ...draft, date: event.target.value })}
          className="soft-ring rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
        />
        <input
          type="time"
          value={draft.time}
          onChange={(event) => setDraft({ ...draft, time: event.target.value })}
          className="soft-ring rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
        />
        <button
          type="button"
          onClick={addSlot}
          className="soft-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <PlusCircle className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {batch.map((slot) => (
          <span key={`${slot.date}-${slot.time}`} className="rounded-full bg-sky-400/10 px-3 py-1 text-sm text-sky-200">
            {slot.date} · {slot.time}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={submitSlots}
        className="soft-ring mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950"
      >
        Save slot batch
      </button>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  const loadStudentData = async () => {
    const [dashboardResult, appointmentResult, slotResult] = await Promise.all([
      dashboardApi.get(),
      appointmentsApi.student(),
      slotsApi.available(),
    ])

    setDashboard(dashboardResult.data.dashboard)
    setAppointments(appointmentResult.data.appointments)
    setSlots(slotResult.data.slots)
  }

  const loadFacultyData = async () => {
    const [dashboardResult, appointmentResult, slotResult] = await Promise.all([
      dashboardApi.get(),
      appointmentsApi.faculty(),
      slotsApi.faculty(),
    ])

    setDashboard(dashboardResult.data.dashboard)
    setAppointments(appointmentResult.data.appointments)
    setSlots(slotResult.data.slots)
  }

  const loadData = async () => {
    setLoading(true)

    try {
      if (user.role === 'student') {
        await loadStudentData()
      } else {
        await loadFacultyData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 30000)
    return () => clearInterval(timer)
  }, [user.role])

  const handleCreateSlots = async (batch) => {
    try {
      await slotsApi.create({ slots: batch })
      toast.success('Slots created')
      await loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create slots')
    }
  }

  const handleAppointmentAction = async (action, id, payload) => {
    try {
      await appointmentsApi[action](id, payload)
      toast.success(`Appointment ${action}d`)
      await loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  if (loading || !dashboard) {
    return <div className="page-enter rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">Loading dashboard...</div>
  }

  if (user.role === 'student') {
    return (
      <div className="page-enter grid gap-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <StatCard label="Upcoming appointments" value={dashboard.upcoming.length} hint="Scheduled or awaiting review" />
          <StatCard label="Past appointments" value={dashboard.past.length} hint="Completed or time elapsed" />
          <StatCard label="Completed count" value={dashboard.completedCount} hint="Appointments marked completed" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <AppointmentList title="Upcoming appointments" items={dashboard.upcoming} />
            <AppointmentList title="Past appointments" items={dashboard.past} />
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Booking rules</h3>
                  <p className="text-sm text-slate-400">Next 48 hours unless emergency is selected.</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-400">
                Slots refresh automatically every 30 seconds to reduce booking conflicts.
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5">
              <h3 className="text-lg font-semibold text-white">Available slots</h3>
              <div className="mt-4 space-y-3">
                {slots.slice(0, 6).map((slot) => (
                  <div key={slot._id} className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{slot.facultyId?.name}</p>
                        <p>{formatDateTime(slot.date, slot.time)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Open</span>
                    </div>
                  </div>
                ))}
                {slots.length === 0 ? <p className="text-sm text-slate-400">No open slots yet.</p> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-enter grid gap-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Upcoming appointments" value={dashboard.upcoming.length} hint="Pending and approved" />
        <StatCard label="Past appointments" value={dashboard.past.length} hint="Finished or cancelled" />
        <StatCard label="Completed count" value={dashboard.completedCount} hint="Marked done in the system" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <FacultySlotCreator onCreated={handleCreateSlots} />

        <div className="space-y-6">
          <AppointmentList title="Incoming booking requests" items={appointments} />

          <div className="glass-panel rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-white">Your slots</h3>
            <div className="mt-4 space-y-3">
              {slots.map((slot) => (
                <div key={slot._id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                    <div>
                      <p className="font-medium text-white">{formatDateTime(slot.date, slot.time)}</p>
                      <p>Status: {slot.status}</p>
                    </div>
                    <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
                      {slot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5">
            <h3 className="text-lg font-semibold text-white">Action queue</h3>
            <div className="mt-4 space-y-3">
              {appointments
                .filter((appointment) => appointment.status === 'pending')
                .map((appointment) => (
                  <div key={appointment._id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{appointment.studentId?.name}</p>
                        <p className="text-sm text-slate-400">{formatDateTime(appointment.date, appointment.time)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAppointmentAction('approve', appointment._id)}
                          className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200"
                        >
                          <CheckCircle2 className="mr-2 inline h-4 w-4" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppointmentAction('reject', appointment._id, { reason: 'Rejected by faculty' })}
                          className="rounded-full bg-rose-400/10 px-4 py-2 text-sm text-rose-200"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppointmentAction('cancel', appointment._id, { reason: 'Cancelled by faculty' })}
                          className="rounded-full bg-amber-400/10 px-4 py-2 text-sm text-amber-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppointmentAction('complete', appointment._id)}
                          className="rounded-full bg-sky-400/10 px-4 py-2 text-sm text-sky-200"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {appointments.filter((appointment) => appointment.status === 'pending').length === 0 ? (
                <p className="text-sm text-slate-400">No pending requests right now.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}