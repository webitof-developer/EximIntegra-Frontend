import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  activeSection: string;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  notificationsCount: number;
}

const initialState: UIState = {
  activeSection: "dashboard",
  sidebarCollapsed: false,
  mobileNavOpen: false,
  notificationsCount: 2,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const {
  setActiveSection,
  toggleSidebar,
  setSidebarCollapsed,
  setMobileNavOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
