import 'server-only';

import { StripeServerEnvSchema } from '../schema/stripe-server-env.schema';

const STRIPE_API_VERSION = '2023-10-16';

/**
 * @description returns a Stripe instance
 */
export async function createStripeClient() {
  const { default: Stripe } = await import('stripe');

  // Parse the environment variables and validate them
  const stripeServerEnv = StripeServerEnvSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });

  return new Stripe(stripeServerEnv.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });
}
