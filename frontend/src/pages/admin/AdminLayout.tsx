import { useState, type ReactNode } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex min-h-11 min-w-11 items-center justify-center text-text md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav className="hidden gap-0.5 px-3 py-4 md:flex md:flex-1 md:flex-col">
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

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-[calc(8px+var(--safe-top))]">
            <div className="flex items-center gap-2">
              <img src={primaryLogo} alt="ReelBox" className="h-7 w-auto" />
              <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Admin
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex min-h-11 min-w-11 items-center justify-center text-text"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-12 items-center border-b border-border text-base ${isActive ? 'text-primary' : 'text-text'}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink to="/" onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center text-base text-text">
              ← Back to site
            </NavLink>

            <div className="mt-4 border-t border-border pt-4">
              <p className="truncate text-sm font-medium text-text">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
                className="mt-3 min-h-11 text-left text-sm text-muted"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
