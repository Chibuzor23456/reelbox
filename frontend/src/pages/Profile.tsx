import RequireAuth from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'

function ProfileContent() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="page-gutter py-10">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold text-text">Profile</h1>

        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Name</p>
            <p className="mt-1 text-text">{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Email</p>
            <p className="mt-1 text-text">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Role</p>
            <p className="mt-1 capitalize text-text">{user.role}</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="mt-6 min-h-11 rounded-md border border-border px-5 py-2.5 font-semibold text-text transition-colors hover:border-primary"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  return (
    <RequireAuth title="Profile">
      <ProfileContent />
    </RequireAuth>
  )
}
