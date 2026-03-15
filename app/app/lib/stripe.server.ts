import Stripe from "stripe";

export function getStripe(env: Env) {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });
}

export async function createCheckoutSession(
  stripe: Stripe,
  {
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    quantity,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    quantity?: number;
  }
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: quantity || 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
}

export async function createCustomerPortalSession(
  stripe: Stripe,
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function createStripeCustomer(
  stripe: Stripe,
  email: string,
  name?: string
) {
  return stripe.customers.create({ email, name: name || undefined });
}
