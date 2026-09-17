export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { syncAll } = await import("./lib/sync-all");
    setInterval(async () => {
      try { await syncAll(); } catch {}
    }, 30_000);
  }
}
