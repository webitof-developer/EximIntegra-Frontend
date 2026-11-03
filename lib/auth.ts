import { UserProfile } from "./types";

const TOKEN_KEY = "exim_token";
const USER_KEY = "exim_user";

// In-memory access token storage (never stored in localStorage or sessionStorage for XSS immunity)
let inMemoryAccessToken: string | null = null;

export function getStoredToken(): string | null {
  return inMemoryAccessToken;
}

export function setStoredToken(token: string | null): void {
  inMemoryAccessToken = token;
  // Ensure no sensitive tokens remain in localStorage or sessionStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      // Clean up any legacy document cookies
      document.cookie = "exim_token=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // Ignore storage errors in restricted contexts
    }
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

export function setStoredAuth(token: string, user: UserProfile): void {
  setStoredToken(token);
  setStoredUser(user);
}

export function clearStoredAuth(): void {
  inMemoryAccessToken = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    document.cookie = "exim_token=; path=/; max-age=0; SameSite=Lax";
  } catch {
    // Ignore
  }
}

