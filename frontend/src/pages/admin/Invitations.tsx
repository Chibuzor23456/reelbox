import { useEffect, useState, type FormEvent } from 'react'
import {
  createInvitation,
  listInvitations,
  resendInvitation,
  revokeInvitation,
  type AdminInvitation,
} from '../../lib/admin'
import { ApiError } from '../../lib/api'

export default function Invitations() {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastLink, setLastLink] = useState<{ email: string; link: string; emailSent: boolean } | null>(null)

  function refresh() {
    listInvitations()
      .then((res) => setInvitations(res.invitations))
      .catch(() => {})
  }

  useEffect(refresh, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      const res = await createInvitation(email, name)
      setLastLink({ email: res.email, link: res.invite_link, emailSent: res.email_sent })
      setEmail('')
      setName('')
      refresh()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not create invitation.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend(id: string) {
    const res = await resendInvitation(id)
    setLastLink({ email: res.email, link: res.invite_link, emailSent: res.email_sent })
    refresh()
  }

  async function handleRevoke(id: string) {
    await revokeInvitation(id)
    refresh()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Invitations</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-3 text-text outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
          Name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-3 text-text outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 flex-none rounded-md bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Invite'}
        </button>
      </form>
      {formError && <p className="mb-4 text-sm text-error">{formError}</p>}

      {lastLink && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm">
          <p className="text-text">
            {lastLink.emailSent
              ? `Invitation emailed to ${lastLink.email}.`
              : `Could not email ${lastLink.email} — copy this link and send it manually:`}
          </p>
          <p className="mt-2 break-all rounded bg-surface px-2 py-1.5 font-mono text-xs text-muted">{lastLink.link}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Expires</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invitations.map((inv) => (
              <tr key={inv.id}>
                <td className="px-3 py-2 text-text">{inv.email}</td>
                <td className="px-3 py-2 text-muted">{inv.name ?? '—'}</td>
                <td className="px-3 py-2 text-muted">{inv.status}</td>
                <td className="px-3 py-2 text-muted">{inv.expires_at}</td>
                <td className="px-3 py-2">
                  {inv.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleResend(inv.id)} className="text-primary hover:underline">
                        Resend
                      </button>
                      <button onClick={() => handleRevoke(inv.id)} className="text-error hover:underline">
                        Revoke
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {invitations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  No invitations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
