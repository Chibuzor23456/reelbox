import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  forceLogoutUser,
  listUsers,
  resetUserPassword,
  updateUser,
  type AdminUser,
} from '../../lib/admin'

export default function Users() {
  const { user: currentAdmin } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function refresh() {
    listUsers(search)
      .then((res) => setUsers(res.users))
      .catch(() => {})
  }

  useEffect(refresh, [search])

  async function handleStatus(id: string, status: string) {
    await updateUser(id, { status })
    refresh()
  }

  async function handleRole(id: string, role: string) {
    await updateUser(id, { role })
    refresh()
  }

  async function handleForceLogout(id: string) {
    const res = await forceLogoutUser(id)
    setNotice(`Revoked ${res.sessions_revoked} session(s).`)
  }

  async function handleResetPassword(id: string) {
    const res = await resetUserPassword(id)
    setNotice(
      res.email_sent
        ? `New password emailed to ${res.email}.`
        : `Could not email ${res.email} — temporary password: ${res.temporary_password}`,
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Users</h1>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 min-h-11 w-full max-w-sm rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
      />

      {notice && <p className="mb-4 text-sm text-text">{notice}</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentAdmin?.id
              return (
                <tr key={u.id}>
                  <td className="px-3 py-2 text-text">{u.name}</td>
                  <td className="px-3 py-2 text-muted">{u.email}</td>
                  <td className="px-3 py-2">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => handleRole(u.id, e.target.value)}
                      className="min-h-9 rounded border border-border bg-surface px-2 text-text disabled:opacity-50"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={u.status}
                      disabled={isSelf}
                      onChange={(e) => handleStatus(u.id, e.target.value)}
                      className="min-h-9 rounded border border-border bg-surface px-2 text-text disabled:opacity-50"
                    >
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="deleted">deleted</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {!isSelf && (
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleForceLogout(u.id)} className="text-primary hover:underline">
                          Force logout
                        </button>
                        <button onClick={() => handleResetPassword(u.id)} className="text-primary hover:underline">
                          Reset password
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
