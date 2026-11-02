import { createContext, useContext, useState, type ReactNode } from 'react'

export type User = { id: number; name: string; role: 'user' | 'admin' }

//  fake user . replace 2 function signIn/signOut by real API.
const MOCK_USERS: Record<string, User> = {
  anna:  { id: 1, name: 'Anna',  role: 'user' },
  tomas: { id: 2, name: 'Tomas', role: 'admin' },
}

type AuthValue = {
  user: User | null
  signIn: (who?: 'anna' | 'tomas') => void
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const signIn = (who: 'anna' | 'tomas' = 'anna') => setUser(MOCK_USERS[who])
  // Bwindow.location.href = '/auth/google'
  const signOut = () => setUser(null)
  //  await fetch('/auth/logout', { method: 'POST' }); setUser(null)

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}