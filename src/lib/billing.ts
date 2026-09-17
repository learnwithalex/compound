import DodoPayments from "dodopayments";

export function dodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_BILLING_API_KEY!,
    environment: "live_mode",
  });
}

export const PLAN_PRO_PRODUCT_ID = process.env.DODO_BILLING_PRODUCT_ID!;

export async function createCheckoutSession(userEmail: string, userId: string) {
  const client = dodoClient();
  const appUrl = process.env.APP_URL ?? "https://usecompound.xyz";
  const session = await client.checkoutSessions.create({
    product_cart: [{ product_id: PLAN_PRO_PRODUCT_ID, quantity: 1 }],
    customer: { email: userEmail },
    metadata: { compound_user_id: userId },
    return_url: `${appUrl}/app?upgraded=1`,
    cancel_url: `${appUrl}/app/connect`,
  });
  return session;
}
