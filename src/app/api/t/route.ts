import { db } from "@/db";
import { trackerTokens, analyticsEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  try {
    // Accept both application/json and text/plain (sendBeacon uses text/plain)
    const text = await req.text();
    const body = JSON.parse(text);
    const { token, type, userId, name, props, url, sid } = body;

    if (!token || !type) return new Response(null, { status: 204, headers: CORS });

    const tracker = await db.query.trackerTokens.findFirst({
      where: (t) => eq(t.token, token),
    });
    if (!tracker) return new Response(null, { status: 204, headers: CORS });

    await db.insert(analyticsEvents).values({
      connectionId: tracker.connectionId,
      type: String(type).slice(0, 50),
      userId: userId ? String(userId).toLowerCase().trim().slice(0, 500) : null,
      name: name ? String(name).slice(0, 500) : null,
      properties: props ? JSON.stringify(props).slice(0, 4000) : null,
      url: url ? String(url).slice(0, 2000) : null,
      sessionId: sid ? String(sid).slice(0, 100) : null,
    });
  } catch {
    // never error — analytics must not break the host page
  }
  return new Response(null, { status: 204, headers: CORS });
}
