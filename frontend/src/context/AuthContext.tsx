import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { clearServiceWorkerCaches } from '../lib/serviceWorker'

export type Role = 'admin' | 'user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

type AuthStatus = 'checking' | 'authenticated' | 'guest'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  loginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Runs `action` immediately if signed in, otherwise opens the login modal and
   * runs `action` once sign-in succeeds — used to gate Play, My List, etc. without
   * losing the user's place. */
  requireAuth: (action: () => void) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const pendingAction = useRef<(() => void) | null>(null)

  useEffect(() => {
    api
      .get<AuthUser>('/auth/me')
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        setUser(null)
        setStatus('guest')
      })
  }, [])

  const openLoginModal = useCallback(() => setLoginModalOpen(true), [])

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false)
    pendingAction.current = null
  }, [])

  const requireAuth = useCallback(
    (action: () => void) => {
      if (status === 'authenticated') {
        action()
        return
      }
      pendingAction.current = action
      setLoginModalOpen(true)
    },
    [status],
  )

  const login = useCallback(async (email: string, password: string) => {
    const me = await api.post<AuthUser>('/auth/login', { email, password })
    setUser(me)
    setStatus('authenticated')
    setLoginModalOpen(false)
    const action = pendingAction.current
    pendingAction.current = null
    action?.()
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    clearServiceWorkerCaches()
    setUser(null)
    setStatus('guest')
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, status, loginModalOpen, openLoginModal, closeLoginModal, login, logout, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
