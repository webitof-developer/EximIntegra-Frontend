import { UserProfile } from "./types";

const TOKEN_KEY = "exim_token";
const USER_KEY = "exim_user";
const REFRESH_KEY = "exim_refresh_token_fallback";

// In-memory access token storage
let inMemoryAccessToken: string | null = null;

export function getStoredToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== "undefined") {
    try {
      const sessionToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      if (sessionToken) {
        inMemoryAccessToken = sessionToken;
        return sessionToken;
      }
    } catch {
      // Ignore
    }
  }
  return null;
}

export function setStoredToken(token: string | null): void {
  inMemoryAccessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      localStorage.removeItem(TOKEN_KEY);
      // Clean up legacy cookies
      document.cookie = "exim_token=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setStoredRefreshToken(refreshToken: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      sessionStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch {
    // Ignore
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as UserProfile;
    if (user && user.billingCycle === "trial") {
      return { ...user, tier: "FREE_TRIAL" };
    }
    return user;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    // Store safe user profile for initial UI render
    const displayUser: UserProfile = {
      ...user,
      tier: user.billingCycle === "trial" ? "FREE_TRIAL" : user.tier,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(displayUser));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function setStoredAuth(token: string, user: UserProfile, refreshToken?: string): void {
  setStoredToken(token);
  setStoredUser(user);
  if (refreshToken) {
    setStoredRefreshToken(refreshToken);
  }
}

export function clearStoredAuth(): void {
  inMemoryAccessToken = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    document.cookie = "exim_token=; path=/; max-age=0; SameSite=Lax";
  } catch {
    // Ignore
  }
}

