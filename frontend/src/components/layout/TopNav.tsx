import { Link, NavLink } from 'react-router-dom'
import primaryLogo from '../../assets/brand/logo-primary.png'
import { useAuth } from '../../context/AuthContext'
import { NAV_LINKS } from '../../lib/navLinks'

export default function TopNav() {
  const { status, user, openLoginModal, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-bg/90 backdrop-blur md:block">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-8 py-3">
        <Link to="/" className="flex flex-none items-center">
          <img src={primaryLogo} alt="ReelBox" className="h-8 w-auto" />
        </Link>
        <nav className="flex flex-1 items-center gap-5 overflow-x-auto text-sm text-muted">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `whitespace-nowrap transition-colors hover:text-text ${isActive ? 'text-primary' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/search" className="text-sm text-muted hover:text-text">
          Search
        </NavLink>
        {status === 'authenticated' ? (
          <div className="flex items-center gap-3 text-sm">
            <NavLink to="/my-list" className="text-muted hover:text-text">
              My List
            </NavLink>
            <NavLink to="/profile" className="text-muted hover:text-text">
              {user?.name ?? 'Profile'}
            </NavLink>
            <button onClick={() => logout()} className="text-muted hover:text-text">
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}
