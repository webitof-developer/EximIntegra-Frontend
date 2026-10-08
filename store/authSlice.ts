import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/lib/types";
import { getStoredToken, setStoredToken, clearStoredAuth } from "@/lib/auth";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}


const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = getStoredToken();
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
      state.isInitialized = true;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setStoredToken(action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      clearStoredAuth();
    },
    setUserTier: (
      state,
      action: PayloadAction<"ENTERPRISE" | "PROFESSIONAL" | "STARTER">
    ) => {
      if (state.user) {
        state.user.tier = action.payload;
      }
    },
  },
});

export const { initializeAuth, setCredentials, logout, setUserTier } = authSlice.actions;

export default authSlice.reducer;
