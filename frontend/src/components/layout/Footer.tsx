import { Link } from 'react-router-dom'

const links = [
  { to: '/legal/terms', label: 'Terms of Service' },
  { to: '/legal/privacy', label: 'Privacy Policy' },
  { to: '/legal/cookies', label: 'Cookie Policy' },
  { to: '/legal/copyright', label: 'Copyright & Content Policy' },
  { to: '/legal/acceptable-use', label: 'Acceptable Use' },
  { to: '/legal/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="page-gutter mt-12 border-t border-border py-6">
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-text">
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="mt-3 text-xs text-muted">
        ReelBox organizes content from third-party sources and does not claim ownership of it. See the Copyright
        &amp; Content Policy for details.
      </p>
    </footer>
  )
}
