import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: 'light' | 'dark';
  isLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'light',
  isLoading: false,

  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  toggleMobileSidebar: () => set((state) => ({ 
    sidebarMobileOpen: !state.sidebarMobileOpen 
  })),

  setMobileSidebarOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),

  setTheme: (theme) => set({ theme }),

  setLoading: (isLoading) => set({ isLoading }),
}));

// Helper selectors
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed);
export const useMobileSidebarOpen = () => useUIStore((state) => state.sidebarMobileOpen);
export const useTheme = () => useUIStore((state) => state.theme);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
