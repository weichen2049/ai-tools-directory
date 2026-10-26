import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const exchangeMock = vi.hoisted(() => vi.fn());
const createClientMock = vi.hoisted(() =>
  vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: exchangeMock
    }
  }))
);
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

vi.mock("../../../utils/supabase/server", () => ({
  createClient: createClientMock
}));

describe("auth callback route", () => {
  beforeEach(() => {
    exchangeMock.mockReset();
    createClientMock.mockClear();
  });

  it("redirects recovery flows to reset-password when exchange succeeds", async () => {
    exchangeMock.mockResolvedValue({ error: null });
    const response = await GET(
      new Request(`${baseUrl}/auth/callback?code=abc&type=recovery`)
    );

    expect(response.headers.get("location")).toBe(`${baseUrl}/auth/reset-password`);
  });

  it("redirects when next targets reset-password even without type", async () => {
    exchangeMock.mockResolvedValue({ error: null });
    const response = await GET(
      new Request(`${baseUrl}/auth/callback?code=abc&next=/auth/reset-password`)
    );

    expect(response.headers.get("location")).toBe(`${baseUrl}/auth/reset-password`);
  });

  it("falls back to next when exchange fails", async () => {
    exchangeMock.mockResolvedValue({ error: new Error("fail") });
    const response = await GET(
      new Request(`${baseUrl}/auth/callback?code=abc&next=/account`)
    );

    expect(response.headers.get("location")).toBe(`${baseUrl}/account`);
  });
});