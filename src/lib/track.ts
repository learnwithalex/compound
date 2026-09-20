// Lightweight structured event logger. Events go to stdout (Orizon streams logs).
// Replace with a DB write or analytics service when needed.
export function track(event: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
}
