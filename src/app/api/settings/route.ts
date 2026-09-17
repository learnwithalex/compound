import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { userIdFromSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

type SettingsPatch = {
  digestEnabled?: boolean;
  digestDay?: number;
  milestoneAlerts?: boolean;
  lastMilestoneCents?: number;
  publicPageEnabled?: boolean;
  publicSlug?: string | null;
  publicShowMrr?: boolean;
  publicShowProducts?: boolean;
};

async function getOrCreate(userId: string) {
  let row = await db.query.userSettings.findFirst({ where: (s, { eq }) => eq(s.userId, userId) });
  if (!row) {
    const [created] = await db.insert(userSettings).values({ userId }).returning();
    row = created;
  }
  return row;
}

export async function GET() {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getOrCreate(userId));
}

export async function PATCH(req: NextRequest) {
  const userId = await userIdFromSession();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const patch: SettingsPatch = {};

  if ("digestEnabled" in body) patch.digestEnabled = Boolean(body.digestEnabled);
  if ("digestDay" in body) patch.digestDay = Number(body.digestDay);
  if ("milestoneAlerts" in body) patch.milestoneAlerts = Boolean(body.milestoneAlerts);
  if ("lastMilestoneCents" in body) patch.lastMilestoneCents = Number(body.lastMilestoneCents);
  if ("publicPageEnabled" in body) patch.publicPageEnabled = Boolean(body.publicPageEnabled);
  if ("publicShowMrr" in body) patch.publicShowMrr = Boolean(body.publicShowMrr);
  if ("publicShowProducts" in body) patch.publicShowProducts = Boolean(body.publicShowProducts);

  if ("publicSlug" in body && body.publicSlug) {
    const slug = String(body.publicSlug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40);
    patch.publicSlug = slug;
    const conflict = await db.query.userSettings.findFirst({
      where: (s, { and, eq, ne }) => and(eq(s.publicSlug, slug), ne(s.userId, userId)),
    });
    if (conflict) return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  await getOrCreate(userId);
  const [updated] = await db.update(userSettings)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userSettings.userId, userId))
    .returning();

  return NextResponse.json(updated);
}
