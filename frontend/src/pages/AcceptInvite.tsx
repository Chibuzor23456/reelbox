import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import wordmark from '../assets/brand/wordmark.png'
import { api, ApiError } from '../lib/api'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/accept-invite', { token, name, password, accepted_terms: acceptedTerms })
      // Full reload so AuthContext re-checks /auth/me and picks up the new session.
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accept this invitation.')
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="page-gutter flex min-h-screen items-center justify-center text-center">
        <p className="text-sm text-error">This invitation link is missing its token.</p>
      </div>
    )
  }

  return (
    <div className="page-gutter flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <img src={wordmark} alt="ReelBox" className="mx-auto mb-8 h-7 w-auto" />
        <h1 className="mb-1 text-xl font-semibold text-text">Welcome to ReelBox</h1>
        <p className="mb-6 text-sm text-muted">Set your name and password to finish creating your account.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="invite-name" className="flex flex-col gap-1 text-sm text-muted">
            Name
            <input
              id="invite-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
            />
          </label>
          <label htmlFor="invite-password" className="flex flex-col gap-1 text-sm text-muted">
            Password
            <input
              id="invite-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
            />
          </label>
          <label htmlFor="invite-confirm-password" className="flex flex-col gap-1 text-sm text-muted">
            Confirm password
            <input
              id="invite-confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="min-h-11 rounded-md border border-border bg-card px-3 text-text outline-none focus:border-primary"
            />
          </label>
          <label className="mt-1 flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-none accent-primary"
            />
            <span>
              I agree to the{' '}
              <Link to="/legal/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge the{' '}
              <Link to="/legal/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !acceptedTerms}
            className="mt-2 min-h-11 rounded-md bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
