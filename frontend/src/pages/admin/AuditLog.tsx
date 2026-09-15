import { useEffect, useState } from 'react'
import { listAuditLog, type AuditLogEntry } from '../../lib/admin'

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])

  useEffect(() => {
    listAuditLog()
      .then((res) => setEntries(res.entries))
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Audit Log</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2 text-muted">{e.created_at}</td>
                <td className="px-3 py-2 text-text">{e.admin_name ?? '—'}</td>
                <td className="px-3 py-2 text-text">{e.action}</td>
                <td className="px-3 py-2 text-muted">
                  {e.target_type ? `${e.target_type}: ${e.target_id}` : '—'}
                </td>
                <td className={`px-3 py-2 ${e.result === 'success' ? 'text-success' : 'text-error'}`}>
                  {e.result}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  No activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
