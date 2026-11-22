import { NextResponse } from "next/server";
import { searchBelongingsHumanlike } from "@/lib/search";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, userEmail, isDemo } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await searchBelongingsHumanlike(
      query.trim(),
      userEmail || "alex@family.com",
      Boolean(isDemo)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API endpoint error:", error);
    return NextResponse.json({ error: "Search failed", details: String(error) }, { status: 500 });
  }
}

