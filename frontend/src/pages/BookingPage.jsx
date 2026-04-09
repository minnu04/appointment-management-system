import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { CalendarPlus, Search } from 'lucide-react'
import { appointmentsApi, slotsApi } from '../services/api.js'

const formatDateTime = (date, time) => format(parseISO(`${date}T${time}:00`), 'PPpp')

export function BookingPage() {
  const [slots, setSlots] = useState([])
  const [facultyId, setFacultyId] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [emergencyRequest, setEmergencyRequest] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookLoading, setBookLoading] = useState(false)

  const loadSlots = async () => {
    setLoading(true)

    try {
      const { data } = await slotsApi.available(facultyId ? { facultyId } : undefined)
      setSlots(data.slots)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load slots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
    const timer = setInterval(loadSlots, 30000)
    return () => clearInterval(timer)
  }, [facultyId])

  const faculties = useMemo(() => {
    const map = new Map()
    slots.forEach((slot) => {
      if (slot.facultyId?._id && !map.has(slot.facultyId._id)) {
        map.set(slot.facultyId._id, slot.facultyId)
      }
    })
    return [...map.values()]
  }, [slots])

  const groupedSlots = useMemo(() => {
    return slots.reduce((accumulator, slot) => {
      const key = slot.facultyId?._id || 'unknown'
      if (!accumulator[key]) {
        accumulator[key] = []
      }
      accumulator[key].push(slot)
      return accumulator
    }, {})
  }, [slots])

  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error('Select a slot')
      return
    }

    if (!reason.trim()) {
      toast.error('Add a reason for the meeting')
      return
    }

    setBookLoading(true)

    try {
      await appointmentsApi.book({
        facultyId: selectedSlot.facultyId._id,
        slotId: selectedSlot._id,
        reason,
        emergencyRequest,
        emergencyReason,
      })
      toast.success('Appointment request submitted')
      setReason('')
      setEmergencyReason('')
      setEmergencyRequest(false)
      setSelectedSlot(null)
      await loadSlots()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to book slot')
    } finally {
      setBookLoading(false)
    }
  }

  return (
    <div className="page-enter grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <aside className="glass-panel rounded-[2rem] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Book appointment</h2>
            <p className="text-sm text-slate-400">Emergency requests allow later bookings with a valid reason.</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm text-slate-300">Filter by faculty</span>
          <select
            value={facultyId}
            onChange={(event) => setFacultyId(event.target.value)}
            className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          >
            <option value="">All faculty</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-slate-300">Reason for meeting</span>
          <textarea
            rows="4"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            placeholder="Project discussion, doubt solving, guidance..."
          />
        </label>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={emergencyRequest}
            onChange={(event) => setEmergencyRequest(event.target.checked)}
            className="h-4 w-4"
          />
          Emergency request
        </label>

        {emergencyRequest ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-slate-300">Emergency reason</span>
            <textarea
              rows="4"
              value={emergencyReason}
              onChange={(event) => setEmergencyReason(event.target.value)}
              className="soft-ring w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Explain why you need an urgent booking"
            />
          </label>
        ) : null}

        <button
          type="button"
          onClick={handleBook}
          disabled={bookLoading}
          className="soft-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Search className="h-4 w-4" /> {bookLoading ? 'Submitting...' : 'Book selected slot'}
        </button>
      </aside>

      <section className="glass-panel rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Available slots</h2>
          <button type="button" onClick={loadSlots} className="text-sm text-sky-300 hover:text-sky-200">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-400">Loading slots...</p>
        ) : (
          <div className="mt-6 space-y-5">
            {Object.entries(groupedSlots).map(([facultyKey, facultySlots]) => (
              <div key={facultyKey} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{facultySlots[0].facultyId?.name}</h3>
                    <p className="text-sm text-slate-400">{facultySlots[0].facultyId?.department || 'Faculty'}</p>
                  </div>
                  <span className="text-sm text-slate-400">{facultySlots.length} open slots</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {facultySlots.map((slot) => {
                    const active = selectedSlot?._id === slot._id
                    return (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={[
                          'rounded-2xl border p-4 text-left transition',
                          active
                            ? 'border-sky-400/60 bg-sky-400/10'
                            : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <p className="font-medium text-white">{formatDateTime(slot.date, slot.time)}</p>
                        <p className="mt-2 text-sm text-slate-400">Available to book</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {slots.length === 0 ? <p className="text-sm text-slate-400">No available slots at the moment.</p> : null}
          </div>
        )}
      </section>
    </div>
  )
}