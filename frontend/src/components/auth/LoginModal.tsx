import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loginModalOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-text">Sign in to ReelBox</h2>
          <button
            onClick={closeLoginModal}
            className="-me-2 -mt-2 flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-text"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="login-email" className="flex flex-col gap-1 text-sm text-muted">
            Email
            <input
              id="login-email"
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 rounded-md border border-border bg-card px-3 py-2 text-text outline-none focus:border-primary"
            />
          </label>
          <label htmlFor="login-password" className="flex flex-col gap-1 text-sm text-muted">
            Password
            <span className="relative flex">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 pe-16 text-text outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 end-0 flex min-h-11 min-w-11 items-center justify-center text-xs font-medium text-muted hover:text-text"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 min-h-11 rounded-md bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-xs text-muted">
            Invite-only — no account? Ask an admin for access.
          </p>
        </form>
      </div>
    </div>
  )
}
