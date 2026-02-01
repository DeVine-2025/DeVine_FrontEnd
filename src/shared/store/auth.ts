import { create } from 'zustand';

export type UserRole = 'pm' | 'dev' | null;

type AuthState = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
};

const USER_ROLE_KEY = 'userRole';

export const useAuthStore = create<AuthState>((set) => ({
  role: (localStorage.getItem(USER_ROLE_KEY) as UserRole) ?? null,
  setRole: (role) => {
    if (role) {
      localStorage.setItem(USER_ROLE_KEY, role);
    } else {
      localStorage.removeItem(USER_ROLE_KEY);
    }
    set({ role });
  },
  clearRole: () => {
    localStorage.removeItem(USER_ROLE_KEY);
    set({ role: null });
  },
}));
