import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_HISTORY_LIMIT = 10;
const DEFAULT_HISTORY_TTL_HOURS = 48;

type HistoryArgs = {
  supabase: SupabaseClient<any, "public", any>;
  userId: string;
  limit?: number;
  ttlHours?: number;
};

export async function enforceHistoryRetention({
  supabase,
  userId,
  limit = DEFAULT_HISTORY_LIMIT,
  ttlHours = DEFAULT_HISTORY_TTL_HOURS
}: HistoryArgs): Promise<boolean> {
  if (!userId) return false;

  try {
    const types = ["image", "video"] as const;
    for (const type of types) {
      let query = supabase
        .from("generations")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (type === "image") {
        query = query.or("type.eq.image,type.is.null");
      } else {
        query = query.eq("type", type);
      }

      const { data, error } = await query.range(limit, limit + 49);

      if (error) {
        console.error(`Failed to fetch ${type} history for trimming:`, error);
        continue;
      }

      if (data && data.length > 0) {
        const idsToDelete = data.map((row) => row.id).filter(Boolean);
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase.from("generations").delete().in("id", idsToDelete);
          if (deleteError) {
            console.error(`Failed to trim ${type} history:`, deleteError);
          }
        }
      }
    }

    const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000).toISOString();
    const { error: ttlError } = await supabase
      .from("generations")
      .delete()
      .eq("user_id", userId)
      .lt("created_at", cutoff);
    if (ttlError) {
      console.error("Failed to enforce history TTL:", ttlError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected history retention failure:", error);
    return false;
  }
}