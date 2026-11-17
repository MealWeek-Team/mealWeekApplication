import { createContext } from 'react'

export type User = { id: string; name: string; email: string; role: 'user' | 'admin' }

export type AuthValue = {
  user: User | null
  loading: boolean
  loginWithGoogle: (credential: string) => Promise<void>
  devSignInAdmin: () => void
  signOut: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)