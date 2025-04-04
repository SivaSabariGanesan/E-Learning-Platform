import { create } from 'zustand';
import { User, AuthResponse } from '../types';
import api from '../api/axios';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'teacher', name: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user });
  },
  signUp: async (email, password, role, name) => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      role,
      name,
    });
    localStorage.setItem('token', data.token);
    set({ user: data.user });
  },
  signOut: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
  setUser: (user) => set({ user }),
}));