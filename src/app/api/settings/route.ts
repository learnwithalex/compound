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
  alertNewSub?: boolean;
  alertChurn?: boolean;
  alertUpgrade?: boolean;
  alertPastDue?: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  xHandle?: string | null;
  githubHandle?: string | null;
  bio?: string | null;
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
  if ("alertNewSub" in body) patch.alertNewSub = Boolean(body.alertNewSub);
  if ("alertChurn" in body) patch.alertChurn = Boolean(body.alertChurn);
  if ("alertUpgrade" in body) patch.alertUpgrade = Boolean(body.alertUpgrade);
  if ("alertPastDue" in body) patch.alertPastDue = Boolean(body.alertPastDue);

  if ("displayName" in body) patch.displayName = body.displayName ? String(body.displayName).slice(0, 80) : null;
  if ("avatarUrl" in body) patch.avatarUrl = body.avatarUrl ? String(body.avatarUrl).slice(0, 500) : null;
  if ("xHandle" in body) patch.xHandle = body.xHandle ? String(body.xHandle).replace(/^@/, "").slice(0, 50) : null;
  if ("githubHandle" in body) patch.githubHandle = body.githubHandle ? String(body.githubHandle).replace(/^@/, "").slice(0, 50) : null;
  if ("bio" in body) patch.bio = body.bio ? String(body.bio).slice(0, 160) : null;

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
