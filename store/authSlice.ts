import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/lib/types";
import {
  getStoredToken,
  getStoredUser,
  getStoredRefreshToken,
  setStoredUser,
  setStoredAuth,
  clearStoredAuth,
} from "@/lib/auth";

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
      const user = getStoredUser();
      const refreshToken = getStoredRefreshToken();
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
      // If we have an active token, or if the visitor has no stored user/refresh token (guest), mark initialized.
      // If a user profile or refresh token exists but token is null, keep initialized false
      // so AuthGuard waits for AuthInitializer to perform silent token restoration without redirecting.
      state.isInitialized = Boolean(token) || (!user && !refreshToken);
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile; refreshToken?: string }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isInitialized = true;
      setStoredAuth(action.payload.token, action.payload.user, action.payload.refreshToken);
    },
    updateUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      setStoredUser(action.payload);
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
      action: PayloadAction<"ENTERPRISE" | "PROFESSIONAL" | "STARTER" | "FREE_TRIAL" | string>
    ) => {
      if (state.user) {
        state.user.tier = action.payload;
        setStoredUser(state.user);
      }
    },
  },
});

export const { initializeAuth, setCredentials, updateUser, logout, setUserTier } =
  authSlice.actions;

export default authSlice.reducer;
