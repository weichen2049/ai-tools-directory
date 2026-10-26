import { useCallback, useEffect, useState } from "react";
import { subscribeUsageUpdate } from "@lib/usageEvents";
import { useSupabase } from "../providers/SupabaseProvider";

export type UsageSummary = {
  authenticated: boolean;
  guest?: {
    limit: number;
    used: number;
  };
  nano: {
    limit: number;
    used: number;
  };
  pro: {
    limit: number;
    used: number;
  };
  image: {
    limit: number;
    used: number;
  };
  video: {
    limit: number;
    used: number;
  };
  credits: {
    paid: number;
    bonus: number;
    bonusExpiresAt: string | null;
  };
  signupBonus: {
    amount: number;
    expiresInDays: number;
    claimed: boolean;
  };
  costs: {
    nano: number;
    pro: number;
    image: number;
    video: number;
  };
};

export function useUsageSummary() {
  const { user } = useSupabase();
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usage", { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as UsageSummary;
      setSummary(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSummary(null);
  }, [user?.id]);

  useEffect(() => {
    fetchSummary();
    const unsubscribe = subscribeUsageUpdate(fetchSummary);
    return () => {
      unsubscribe();
    };
  }, [fetchSummary, user?.id]);

  return { summary, loading, refresh: fetchSummary };
}