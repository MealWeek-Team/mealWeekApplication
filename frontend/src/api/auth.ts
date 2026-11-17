
import { apiFetch } from './clients';
import type { User } from '../auth/context';

export type AuthResponse = { token: string; user: User };

export function googleLoginApi(credential: string) {
    return apiFetch<AuthResponse>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    });
}

export function fetchMeApi() {
    return apiFetch<{ user: User }>('/api/auth/me');
}
