import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

/** Gates the whole admin portal to signed-in admins. Unlike the consumer
 * RequireAuth, this never opens the login modal — the admin portal isn't
 * something a guest gets prompted into mid-browse. */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()

  if (status === 'checking') return null

  if (status !== 'authenticated' || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg page-gutter text-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Admin access required</h1>
          <p className="mt-2 text-sm text-muted">Sign in with an admin account to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
