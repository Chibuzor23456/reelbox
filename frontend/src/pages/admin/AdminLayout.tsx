import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import primaryLogo from '../../assets/brand/logo-primary.png'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/invitations', label: 'Invitations' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/channels', label: 'Channels' },
  { to: '/admin/vod', label: 'VOD' },
  { to: '/admin/audit-log', label: 'Audit Log' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex flex-col md:flex-row">
        <aside className="flex-none border-b border-border bg-surface md:flex md:min-h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
          <div className="page-gutter flex items-center justify-between border-border py-3 md:border-b md:py-5">
            <div className="flex items-center gap-2">
              <img src={primaryLogo} alt="ReelBox" className="h-7 w-auto" />
              <span className="hidden rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted md:inline">
                Admin
              </span>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:gap-0.5 md:px-3 md:py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex-none whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-muted hover:bg-card hover:text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden border-t border-border px-4 py-4 md:block">
            <p className="truncate text-xs font-medium text-text">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
            <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
              <NavLink to="/" className="text-xs text-muted hover:text-text">
                ← Back to site
              </NavLink>
              <button onClick={() => logout()} className="text-left text-xs text-muted hover:text-text">
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 page-gutter py-6 md:py-8">{children}</main>
      </div>
    </div>
  )
}
