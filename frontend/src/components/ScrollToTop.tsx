import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Plain <Routes> (not a data router) does no scroll restoration on its own —
 * without this, navigating to a new page keeps the old scroll offset, which
 * on a shorter page can land the viewport past all real content. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
