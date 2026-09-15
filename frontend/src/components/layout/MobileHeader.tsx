import { Link } from 'react-router-dom'
import primaryLogo from '../../assets/brand/logo-primary.png'
import { useAuth } from '../../context/AuthContext'

/** Responsive spec section 5.2: mobile gets a compact header with at least
 * branding — not nothing, and not the full desktop nav shrunk down. */
export default function MobileHeader() {
  const { status, openLoginModal } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg/90 px-4 pb-2 pt-[calc(8px+var(--safe-top))] backdrop-blur md:hidden">
      <Link to="/" className="flex items-center">
        <img src={primaryLogo} alt="ReelBox" className="h-7 w-auto" />
      </Link>
      {status !== 'authenticated' && (
        <button
          onClick={openLoginModal}
          className="min-h-9 rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-deep"
        >
          Sign in
        </button>
      )}
    </header>
  )
}
