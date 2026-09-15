import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live TV' },
  { to: '/search', label: 'Search' },
  { to: '/my-list', label: 'My List' },
  { to: '/profile', label: 'Profile' },
]

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[var(--safe-bottom)] md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex min-h-11 flex-1 items-center justify-center text-xs ${isActive ? 'text-primary' : 'text-muted'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
