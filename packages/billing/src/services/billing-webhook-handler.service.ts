import { Database } from '@kit/supabase/database';

type SubscriptionObject = Database['public']['Tables']['subscriptions'];

type SubscriptionUpdateParams = SubscriptionObject['Update'];

/**
 * Represents an abstract class for handling billing webhook events.
 */
export abstract class BillingWebhookHandlerService {
  abstract verifyWebhookSignature(request: Request): Promise<unknown>;

  abstract handleWebhookEvent(
    event: unknown,
    params: {
      onCheckoutSessionCompleted: (
        subscription: SubscriptionObject['Row'],
        customerId: string,
      ) => Promise<unknown>;

      onSubscriptionUpdated: (
        subscription: SubscriptionUpdateParams,
      ) => Promise<unknown>;

      onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
    },
  ): Promise<unknown>;
}
