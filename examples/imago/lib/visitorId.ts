"use client";

const STORAGE_KEY = "imago_visitor_id";
const COOKIE_KEY = "imago_vid";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; sameSite=lax`;
}

export function ensureVisitorId() {
  if (typeof window === "undefined") return null;
  let id = window.localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_KEY);
  if (!id) {
    id =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
  }
  writeCookie(COOKIE_KEY, id);
  return id;
}