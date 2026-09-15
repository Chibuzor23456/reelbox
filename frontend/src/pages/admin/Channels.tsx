import { useEffect, useState } from 'react'
import { listAdminChannels, updateChannelStatus, type AdminChannel } from '../../lib/admin'

export default function Channels() {
  const [channels, setChannels] = useState<AdminChannel[]>([])
  const [search, setSearch] = useState('')

  function refresh() {
    listAdminChannels(search)
      .then((res) => setChannels(res.channels))
      .catch(() => {})
  }

  useEffect(refresh, [search])

  async function handleStatus(id: string, status: string) {
    await updateChannelStatus(id, status)
    refresh()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Channels</h1>

      <input
        type="search"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 min-h-11 w-full max-w-sm rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Playback</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {channels.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 text-text">{c.name}</td>
                <td className="px-3 py-2 text-muted">{c.country ?? '—'}</td>
                <td className="px-3 py-2 text-muted">{c.category ?? '—'}</td>
                <td className="px-3 py-2 text-muted">{c.playback_mode}</td>
                <td className="px-3 py-2">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatus(c.id, e.target.value)}
                    className="min-h-9 rounded border border-border bg-surface px-2 text-text"
                  >
                    <option value="active">active</option>
                    <option value="unavailable">unavailable</option>
                    <option value="disabled">disabled</option>
                  </select>
                </td>
              </tr>
            ))}
            {channels.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  No channels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
