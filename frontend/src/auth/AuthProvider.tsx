
import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type User } from './context';
import { TOKEN_KEY } from '../api/clients';
import { fetchMeApi, googleLoginApi } from '../api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    fetchMeApi()
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
  }, []);

  async function loginWithGoogle(credential: string) {
    const res = await googleLoginApi(credential);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
  }

  function devSignInAdmin() {
    setUser({ id: '2', name: 'Tomas', email: 'tomas@dev.local', role: 'admin' });
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
      <AuthContext.Provider value={{ user, loading, loginWithGoogle, devSignInAdmin, signOut }}>
        {children}
      </AuthContext.Provider>
  );
}
