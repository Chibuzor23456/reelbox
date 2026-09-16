import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import primaryLogo from '../../assets/brand/logo-primary.png'
import { useAuth } from '../../context/AuthContext'
import { NAV_LINKS } from '../../lib/navLinks'

/** Responsive spec section 5.2: mobile gets a compact header with at least
 * branding — not nothing, and not the full desktop nav shrunk down. The
 * hamburger menu is where all the category links TopNav shows on desktop
 * live on mobile, since the 5-slot bottom nav has no room for them. */
export default function MobileHeader() {
  const { status, user, openLoginModal, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-bg/90 px-4 pb-2 pt-[calc(8px+var(--safe-top))] backdrop-blur md:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex min-h-11 min-w-11 flex-none items-center justify-center text-text"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="flex items-center">
          <img src={primaryLogo} alt="ReelBox" className="h-7 w-auto" />
        </Link>
        {status !== 'authenticated' ? (
          <button
            onClick={openLoginModal}
            className="min-h-9 flex-none rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Sign in
          </button>
        ) : (
          <span className="min-h-11 w-11 flex-none" aria-hidden="true" />
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden">
          <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-[calc(8px+var(--safe-top))]">
            <img src={primaryLogo} alt="ReelBox" className="h-7 w-auto" />
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
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-12 items-center border-b border-border text-base ${isActive ? 'text-primary' : 'text-text'}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/search"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center border-b border-border text-base ${isActive ? 'text-primary' : 'text-text'}`
              }
            >
              Search
            </NavLink>

            {status === 'authenticated' ? (
              <>
                <NavLink
                  to="/my-list"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center border-b border-border text-base ${isActive ? 'text-primary' : 'text-text'}`
                  }
                >
                  My List
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center border-b border-border text-base ${isActive ? 'text-primary' : 'text-text'}`
                  }
                >
                  {user?.name ?? 'Profile'}
                </NavLink>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="flex min-h-12 items-center text-left text-base text-muted"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  openLoginModal()
                }}
                className="mt-4 min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
