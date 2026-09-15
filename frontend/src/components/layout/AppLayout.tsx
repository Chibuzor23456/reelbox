import type { ReactNode } from 'react'
import LoginModal from '../auth/LoginModal'
import OfflineBanner from '../OfflineBanner'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import MobileHeader from './MobileHeader'
import TopNav from './TopNav'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <OfflineBanner />
      <TopNav />
      <MobileHeader />
      <main className="pb-[calc(var(--bottom-nav-height)+var(--safe-bottom))] md:pb-0">
        {children}
        <Footer />
      </main>
      <MobileBottomNav />
      <LoginModal />
    </div>
  )
}
