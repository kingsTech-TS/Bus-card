import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface UIStore {
  theme: Theme;
  sidebarOpen: boolean;
  /** Off-canvas navigation on small screens (not persisted). */
  mobileNavOpen: boolean;
  editorPanelOpen: "elements" | "layers" | "ai" | null;

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setEditorPanel: (panel: UIStore["editorPanelOpen"]) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarOpen: true,
      mobileNavOpen: false,
      editorPanelOpen: "elements",

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setEditorPanel: (panel) => set({ editorPanelOpen: panel }),
    }),
    {
      name: "buscard-ui",
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }),
    }
  )
);
