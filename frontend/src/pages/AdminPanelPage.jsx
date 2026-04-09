import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, CheckCircle2, XCircle } from 'lucide-react'
import { adminApi } from '../services/api.js'
import { StatCard } from '../components/StatCard.jsx'

export function AdminPanelPage() {
  const [overview, setOverview] = useState(null)
  const [faculty, setFaculty] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)

    try {
      const [overviewResult, facultyResult, usersResult] = await Promise.all([
        adminApi.overview(),
        adminApi.faculty(),
        adminApi.users(),
      ])

      setOverview(overviewResult.data.overview)
      setFaculty(facultyResult.data.faculty)
      setUsers(usersResult.data.users)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFacultyDecision = async (id, action) => {
    try {
      if (action === 'approve') {
        await adminApi.approveFaculty(id)
      } else {
        await adminApi.rejectFaculty(id, { reason: 'Rejected by admin' })
      }

      toast.success(`Faculty ${action}d`)
      await loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  if (loading || !overview) {
    return <div className="page-enter rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">Loading admin panel...</div>
  }

  return (
    <div className="page-enter grid gap-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Students" value={overview.students} />
        <StatCard label="Faculty" value={overview.faculty} />
        <StatCard label="Approved faculty" value={overview.approvedFaculty} />
        <StatCard label="Pending faculty" value={overview.pendingFaculty} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-sky-300" />
            <h2 className="text-lg font-semibold text-white">Faculty approvals</h2>
          </div>

          <div className="mt-4 space-y-3">
            {faculty.map((member) => (
              <div key={member._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                    <p className="text-sm text-slate-500">{member.department || 'No department listed'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200 bg-white/5">
                      {member.approved ? 'Approved' : 'Pending'}
                    </span>
                    {!member.approved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFacultyDecision(member._id, 'approve')}
                          className="rounded-full bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
                        >
                          <CheckCircle2 className="mr-1 inline h-4 w-4" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFacultyDecision(member._id, 'reject')}
                          className="rounded-full bg-rose-400/10 px-3 py-2 text-sm text-rose-200"
                        >
                          <XCircle className="mr-1 inline h-4 w-4" /> Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5">
          <h2 className="text-lg font-semibold text-white">All users</h2>
          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div key={user._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}