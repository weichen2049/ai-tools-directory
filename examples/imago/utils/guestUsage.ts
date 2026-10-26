import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "imago_guest_nano";
const SECRET = process.env.GUEST_USAGE_SECRET || process.env.API_TOKEN || "imago-guest";

type GuestCookiePayload = {
  used: number;
  visitor?: string;
};

const serialize = (payload: GuestCookiePayload) => JSON.stringify(payload);
const sign = (input: string) => crypto.createHmac("sha256", SECRET).update(input).digest("hex");

export function getGuestCookieName() {
  return COOKIE_NAME;
}

export function decodeGuestUsage(value: string | undefined | null): GuestCookiePayload {
  if (!value) return { used: 0 };
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return { used: 0 };
  const raw = Buffer.from(encoded, "base64").toString("utf8");
  const expected = sign(raw);
  if (expected !== signature) return { used: 0 };
  try {
    const parsed = JSON.parse(raw) as GuestCookiePayload;
    if (typeof parsed.used !== "number" || parsed.used < 0) parsed.used = 0;
    return parsed;
  } catch {
    return { used: 0 };
  }
}

export function encodeGuestUsage(payload: GuestCookiePayload) {
  const raw = serialize(payload);
  const encoded = Buffer.from(raw, "utf8").toString("base64");
  const signature = sign(raw);
  return `${encoded}.${signature}`;
}

export const guestCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365
};