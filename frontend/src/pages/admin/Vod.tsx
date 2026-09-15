import { useEffect, useState } from 'react'
import { listAdminVod, updateVodStatus, type AdminVodItem } from '../../lib/admin'

export default function Vod() {
  const [items, setItems] = useState<AdminVodItem[]>([])
  const [search, setSearch] = useState('')

  function refresh() {
    listAdminVod(search)
      .then((res) => setItems(res.items))
      .catch(() => {})
  }

  useEffect(refresh, [search])

  async function handleStatus(id: string, status: string) {
    await updateVodStatus(id, status)
    refresh()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">VOD</h1>

      <input
        type="search"
        placeholder="Search by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 min-h-11 w-full max-w-sm rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Genre</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-text">{item.title}</td>
                <td className="px-3 py-2 text-muted">{item.type}</td>
                <td className="px-3 py-2 text-muted">{item.year ?? '—'}</td>
                <td className="px-3 py-2 text-muted">{item.genre ?? '—'}</td>
                <td className="px-3 py-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatus(item.id, e.target.value)}
                    className="min-h-9 rounded border border-border bg-surface px-2 text-text"
                  >
                    <option value="active">active</option>
                    <option value="unavailable">unavailable</option>
                    <option value="disabled">disabled</option>
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  No VOD items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
