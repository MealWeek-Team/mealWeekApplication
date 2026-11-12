import { createContext } from 'react'

export type User = { id: number; name: string; role: 'user' | 'admin' }

export type AuthValue = {
  user: User | null
  signIn: (who?: 'anna' | 'tomas') => void
  signOut: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)