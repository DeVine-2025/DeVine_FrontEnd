import { create } from 'zustand';
import { getCurrentUserId, getStoredUserRole, getUserRoleKey } from '@utils/storage';

export type UserRole = 'pm' | 'dev' | null;

type AuthState = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hydrateRole: (role: UserRole) => void;
  clearRole: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  role: (getStoredUserRole(getCurrentUserId()) as UserRole) ?? null,
  setRole: (role) => {
    const userId = getCurrentUserId();
    const key = getUserRoleKey(userId);
    if (role) {
      localStorage.setItem(key, role);
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem(getUserRoleKey());
    }
    set({ role });
  },
  hydrateRole: (role) => set({ role }),
  clearRole: () => {
    const userId = getCurrentUserId();
    localStorage.removeItem(getUserRoleKey(userId));
    localStorage.removeItem(getUserRoleKey());
    set({ role: null });
  },
}));
