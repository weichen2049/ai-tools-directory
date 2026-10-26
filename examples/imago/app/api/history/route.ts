import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return new NextResponse("Auth not configured", { status: 503 });
  }
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const rangeStart = Number(url.searchParams.get("from") ?? "0");
  const rangeEnd = Number(url.searchParams.get("to") ?? "19");
  const type = url.searchParams.get("type"); // "image" | "video"

  let query = supabase
    .from("generations")
    .select("id, model_id, image_url, video_url, summary, prompt_raw, metadata, credits_spent, status, created_at, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (type === "image") {
    query = query.or("type.eq.image,type.is.null");
  } else if (type === "video") {
    query = query.eq("type", "video");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch generation history:", error);
    return new NextResponse("Failed to load history", { status: 500 });
  }

  return NextResponse.json({
    data,
    range: { from: rangeStart, to: rangeEnd }
  });
}