import { useEffect, useState } from 'react'
import { getDashboard, type AdminDashboard } from '../../lib/admin'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text">{value}</p>
    </div>
  )
}

function JobStatus({ label, job }: { label: string; job: AdminDashboard['playlist_status'] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      {job ? (
        <>
          <p className="mt-1 text-sm text-text">
            {job.status} · {job.total_items} items
          </p>
          <p className="text-xs text-muted">
            Last full run: {job.last_full_run_at ?? 'never'}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">Not run yet</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Could not load the dashboard.'))
  }, [])

  if (error) return <p className="text-sm text-error">{error}</p>
  if (!data) return null

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total users" value={data.users.total} />
        <StatCard label="Active users" value={data.users.active} />
        <StatCard label="Suspended" value={data.users.suspended} />
        <StatCard label="Active today" value={data.active_users_today} />
        <StatCard label="Channels" value={data.channels.total} />
        <StatCard label="Movies" value={data.vod.movie} />
        <StatCard label="Series" value={data.vod.series} />
        <StatCard label="EPG programmes" value={data.epg_programme_count} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-text">Ingestion status</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <JobStatus label="Live playlist" job={data.playlist_status} />
        <JobStatus label="VOD catalogue" job={data.vod_status} />
        <JobStatus label="EPG guide" job={data.epg_status} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-text">Recent users</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.recent_users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 text-text">{u.name}</td>
                <td className="px-3 py-2 text-muted">{u.email}</td>
                <td className="px-3 py-2 text-muted">{u.status}</td>
                <td className="px-3 py-2 text-muted">{u.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
