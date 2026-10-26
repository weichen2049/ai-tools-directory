import { describe, expect, it } from "vitest";
import { buildCallbackSearchParams } from "./redirects";

describe("buildCallbackSearchParams", () => {
  it("returns null when code is missing", () => {
    expect(buildCallbackSearchParams({ code: null })).toBeNull();
  });

  it("returns only code when type and next are missing", () => {
    const search = buildCallbackSearchParams({ code: "abc" });
    expect(search).toBe("code=abc");
  });

  it("includes type when provided", () => {
    const search = buildCallbackSearchParams({ code: "abc", type: "recovery" });
    const params = new URLSearchParams(search ?? "");
    expect(params.get("code")).toBe("abc");
    expect(params.get("type")).toBe("recovery");
    expect(params.has("next")).toBe(false);
  });

  it("includes next when provided", () => {
    const search = buildCallbackSearchParams({ code: "abc", next: "/auth/reset-password" });
    const params = new URLSearchParams(search ?? "");
    expect(params.get("code")).toBe("abc");
    expect(params.get("next")).toBe("/auth/reset-password");
    expect(params.has("type")).toBe(false);
  });
});