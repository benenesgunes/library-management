import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isStaff: false,
      user: null,
      setAuth: (token, user, isStaffUser) => set({ token, user, isStaff: isStaffUser }),
      logout: () => set({ token: null, isStaff: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;