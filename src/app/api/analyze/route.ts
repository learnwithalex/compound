import { NextResponse } from "next/server";
import { userIdFromSession } from "@/lib/auth";
import { portfolioMetrics } from "@/lib/metrics";
import { generateBrief } from "@/lib/brief";

export async function POST() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const metrics = await portfolioMetrics(userId);
  if (metrics.products.length === 0) {
    return NextResponse.json({ error: "Connect a product first — there's nothing to brief on yet." }, { status: 400 });
  }

  try {
    return NextResponse.json({ brief: await generateBrief(metrics) });
  } catch (err) {
    console.error("brief generation failed", err);
    return NextResponse.json({ error: "Couldn't reach the model. Try again in a moment." }, { status: 502 });
  }
}
