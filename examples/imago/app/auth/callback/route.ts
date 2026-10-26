import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type");
  const shouldResetPassword = type === "recovery" || next === "/auth/reset-password";

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(new URL(next, origin));
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (shouldResetPassword) {
        return NextResponse.redirect(new URL("/auth/reset-password", origin));
      }
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}