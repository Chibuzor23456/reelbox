import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children, title }: { children: ReactNode; title: string }) {
  const { status, openLoginModal } = useAuth()

  if (status === 'checking') return null

  if (status !== 'authenticated') {
    return (
      <div className="page-gutter flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        <p className="max-w-sm text-muted">Sign in to see this.</p>
        <button
          onClick={openLoginModal}
          className="min-h-11 rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          Sign in
        </button>
      </div>
    )
  }

  return <>{children}</>
}
