export function StatCard({ label, value, hint }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-semibold text-white">{value}</h3>
      </div>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}