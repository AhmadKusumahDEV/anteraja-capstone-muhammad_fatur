import { create } from 'zustand';
import api from '../services/api';
import type { UserInfo, LoginResponse } from '../types/auth';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (nik: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (nik: string, password: string) => {
    // Calling POST /auth/login (doesn't need token)
    const { data } = await api.post<LoginResponse>('/auth/login', { nik, password });
    
    if (data.success) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      
      set({ 
        user: data.data.user,
        isAuthenticated: true 
      });
    } else {
      throw new Error(data.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      // Best effort logout API call
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state regardless of API success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem('access_token')) {
      return;
    }
    
    try {
      const { data } = await api.get<{ success: boolean; data: UserInfo }>('/auth/me');
      if (data.success) {
        set({ 
          user: data.data,
          isAuthenticated: true 
        });
      }
    } catch (error) {
      // If unauthorized, the interceptor will handle the refresh/redirect
      console.error('Failed to fetch user profile:', error);
      // Let's assume if we can't fetch me, and token didn't refresh, we are logged out.
      if (!localStorage.getItem('access_token')) {
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  }
}));
