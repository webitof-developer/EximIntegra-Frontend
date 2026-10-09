import { UserProfile } from "./types";

const TOKEN_KEY = "exim_token";
const USER_KEY = "exim_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set a document cookie so server or middleware can access if needed
    document.cookie = `exim_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function setStoredAuth(token: string, user: UserProfile): void {
  setStoredToken(token);
  setStoredUser(user);
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "exim_token=; path=/; max-age=0";
  } catch {
    // Ignore
  }
}

