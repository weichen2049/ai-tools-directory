import { describe, expect, it, vi } from "vitest";
import { completePasswordReset } from "./resetFlow";

describe("completePasswordReset", () => {
  it("signs out and redirects after delay", async () => {
    vi.useFakeTimers();
    try {
      const signOut = vi.fn().mockResolvedValue(undefined);
      const push = vi.fn();

      await completePasswordReset({
        supabase: { auth: { signOut } },
        router: { push },
        redirectPath: "/login",
        delayMs: 1500
      });

      expect(signOut).toHaveBeenCalledTimes(1);
      expect(push).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1500);
      expect(push).toHaveBeenCalledWith("/login");
    } finally {
      vi.useRealTimers();
    }
  });

  it("still redirects when signOut fails", async () => {
    vi.useFakeTimers();
    try {
      const signOut = vi.fn().mockRejectedValue(new Error("fail"));
      const push = vi.fn();

      await completePasswordReset({
        supabase: { auth: { signOut } },
        router: { push },
        delayMs: 500
      });

      vi.advanceTimersByTime(500);
      expect(push).toHaveBeenCalledWith("/");
    } finally {
      vi.useRealTimers();
    }
  });
});