import { create } from 'zustand';
import { UserRole } from './types';
import { View } from './App';

interface AppState {
  isLoggedIn: boolean;
  userRole: UserRole;
  currentView: View;
  isBigScreen: boolean;
  sidebarOpen: boolean;
  setLoggedIn: (status: boolean, role?: UserRole) => void;
  setCurrentView: (view: View) => void;
  setBigScreen: (status: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  userRole: UserRole.AssetAdmin,
  currentView: 'cockpit',
  isBigScreen: false,
  sidebarOpen: false,
  setLoggedIn: (status, role) =>
    set((state) => ({
      isLoggedIn: status,
      userRole: role ?? state.userRole,
    })),
  setCurrentView: (view) => set(() => ({ currentView: view })),
  setBigScreen: (status) => set(() => ({ isBigScreen: status })),
  setSidebarOpen: (open) => set(() => ({ sidebarOpen: open })),
}));
