import { db } from "@/db";
import { trackerTokens, analyticsEvents } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { TrackingTabClient } from "./tracking-tab-client";

export async function TrackingTab({ connectionId, productLabel }: { connectionId: string; productLabel: string }) {
  // Get or create the tracker token
  let tracker = await db.query.trackerTokens.findFirst({
    where: (t) => eq(t.connectionId, connectionId),
  });
  if (!tracker) {
    const [created] = await db.insert(trackerTokens).values({ connectionId }).returning();
    tracker = created;
  }

  // Count events received so far
  const [{ value: eventCount }] = await db
    .select({ value: count() })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.connectionId, connectionId));

  return (
    <TrackingTabClient
      token={tracker!.token}
      eventCount={Number(eventCount)}
      productLabel={productLabel}
    />
  );
}
