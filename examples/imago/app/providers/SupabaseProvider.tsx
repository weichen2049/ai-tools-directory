"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, isPreviewMode } from "../../utils/supabase/client";

type SupabaseContextType = {
  supabase: SupabaseClient | null;
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPreview: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isPreviewMode());
  const isPreview = isPreviewMode();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    const handleInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          if (error.message?.toLowerCase().includes("refresh token")) {
            await supabase.auth.signOut().catch(() => undefined);
          }
          setSession(null);
        } else {
          setSession(data.session ?? null);
        }
      } catch {
        if (!mounted) return;
        setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void handleInitialSession();

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/reset-password";
        }
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      console.warn("[Preview Mode] Sign in disabled");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined
      }
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      console.warn("[Preview Mode] Sign out disabled");
      return;
    }
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user ?? null,
      loading,
      isPreview,
      signInWithGoogle,
      signOut
    }),
    [supabase, session, loading, isPreview, signInWithGoogle, signOut]
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}