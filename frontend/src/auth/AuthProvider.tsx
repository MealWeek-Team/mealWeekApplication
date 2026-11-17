import { useState, type ReactNode } from 'react'
import { AuthContext, type User } from './context'

const MOCK_USERS: Record<string, User> = {
  anna:  { id: 1, name: 'Anna',  role: 'user' },
  tomas: { id: 2, name: 'Tomas', role: 'admin' },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const signIn = (who: 'anna' | 'tomas' = 'anna') => setUser(MOCK_USERS[who])
  const signOut = () => setUser(null)

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}