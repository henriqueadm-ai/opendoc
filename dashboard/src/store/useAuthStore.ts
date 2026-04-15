import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'LAWYER';
  plan: 'LIGHT' | 'PRO';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  pendingUserId: number | null; // Para o fluxo 2FA (step intermediário)
  isAuthenticated: boolean;

  setCredentials: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setPending2FA: (userId: number) => void;
  clearPending2FA: () => void;
  logout: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      pendingUserId: null,
      isAuthenticated: false,

      setCredentials: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true, pendingUserId: null }),

      setUser: (user) => set({ user }),

      setPending2FA: (userId) => set({ pendingUserId: userId }),

      clearPending2FA: () => set({ pendingUserId: null }),

      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, pendingUserId: null, isAuthenticated: false }),
    }),
    {
      name: 'opendoc-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Helper para fazer fetch autenticado contra a API.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expirado — limpar estado
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}
