import { z } from 'zod';

const BillingIntervalSchema = z.enum(['month', 'year']);
const LineItemTypeSchema = z.enum(['base', 'per-seat', 'metered']);

export const BillingProviderSchema = z.enum([
  'stripe',
  'paddle',
  'lemon-squeezy',
]);

export const PaymentTypeSchema = z.enum(['one-time', 'recurring']);

export const LineItemSchema = z
  .object({
    id: z
      .string({
        description:
          'Unique identifier for the line item. Defined by the Provider.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the line item. Displayed to the user.',
      })
      .min(1),
    description: z
      .string({
        description:
          'Description of the line item. Displayed to the user and will replace the auto-generated description inferred' +
          ' from the line item. This is useful if you want to provide a more detailed description to the user.',
      })
      .optional(),
    cost: z
      .number({
        description: 'Cost of the line item. Displayed to the user.',
      })
      .min(0),
    type: LineItemTypeSchema,
    unit: z
      .string({
        description:
          'Unit of the line item. Displayed to the user. Example "seat" or "GB"',
      })
      .optional(),
    included: z
      .number({
        description: 'Included amount of the line item. Displayed to the user.',
      })
      .optional(),
    tiers: z
      .array(
        z.object({
          upTo: z
            .number({
              description:
                'Up to this amount the cost is the base cost. Displayed to the user.',
            })
            .min(0),
          cost: z
            .number({
              description:
                'Cost of the line item after the upTo amount. Displayed to the user.',
            })
            .min(0),
        }),
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.type !== 'metered' || (data.unit && data.included !== undefined),
    {
      message: 'Metered line items must have a unit and included amount',
      path: ['type', 'unit', 'included'],
    },
  );

export const PlanSchema = z
  .object({
    id: z
      .string({
        description: 'Unique identifier for the plan. Defined by yourself.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the plan. Displayed to the user.',
      })
      .min(1),
    interval: BillingIntervalSchema.optional(),
    lineItems: z.array(LineItemSchema),
    trialPeriod: z
      .number({
        description:
          'Number of days for the trial period. Leave empty for no trial.',
      })
      .positive()
      .optional(),
    paymentType: PaymentTypeSchema,
  })
  .refine((data) => data.lineItems.length > 0, {
    message: 'Plans must have at least one line item',
    path: ['lineItems'],
  })
  .refine(
    (data) => data.paymentType !== 'one-time' || data.interval === undefined,
    {
      message: 'One-time plans must not have an interval',
      path: ['paymentType', 'interval'],
    },
  )
  .refine(
    (data) => data.paymentType !== 'recurring' || data.interval !== undefined,
    {
      message: 'Recurring plans must have an interval',
      path: ['paymentType', 'interval'],
    },
  )
  .refine(
    (item) => {
      const ids = item.lineItems.map((item) => item.id);

      return ids.length === new Set(ids).size;
    },
    {
      message: 'Line item IDs must be unique',
      path: ['lineItems'],
    },
  )
  .refine(
    (data) => {
      if (data.paymentType === 'one-time') {
        const baseItems = data.lineItems.filter((item) => item.type !== 'base');

        return baseItems.length === 0;
      }

      return true;
    },
    {
      message: 'One-time plans must not have non-base line items',
      path: ['paymentType', 'lineItems'],
    },
  );

const ProductSchema = z
  .object({
    id: z
      .string({
        description:
          'Unique identifier for the product. Defined by th Provider.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the product. Displayed to the user.',
      })
      .min(1),
    description: z
      .string({
        description: 'Description of the product. Displayed to the user.',
      })
      .min(1),
    currency: z
      .string({
        description: 'Currency code for the product. Displayed to the user.',
      })
      .min(3)
      .max(3),
    badge: z
      .string({
        description:
          'Badge for the product. Displayed to the user. Example: "Popular"',
      })
      .optional(),
    features: z.array(z.string()).nonempty(),
    highlighted: z
      .boolean({
        description: 'Highlight this product. Displayed to the user.',
      })
      .optional(),
    plans: z.array(PlanSchema),
  })
  .refine((data) => data.plans.length > 0, {
    message: 'Products must have at least one plan',
    path: ['plans'],
  })
  .refine(
    (item) => {
      const planIds = item.plans.map((plan) => plan.id);

      return planIds.length === new Set(planIds).size;
    },
    {
      message: 'Plan IDs must be unique',
      path: ['plans'],
    },
  );

const BillingSchema = z
  .object({
    provider: BillingProviderSchema,
    products: z.array(ProductSchema).nonempty(),
  })
  .refine(
    (data) => {
      const ids = data.products.flatMap((product) =>
        product.plans.flatMap((plan) => plan.lineItems.map((item) => item.id)),
      );

      return ids.length === new Set(ids).size;
    },
    {
      message: 'Line item IDs must be unique',
      path: ['products'],
    },
  )
  .refine((schema) => {
    if (schema.provider === 'lemon-squeezy') {
      for (const product of schema.products) {
        for (const plan of product.plans) {
          if (plan.lineItems.length > 1) {
            return {
              message: 'Only one line item is allowed for Lemon Squeezy',
              path: ['products', 'plans'],
            };
          }
        }
      }
    }

    return true;
  });

export function createBillingSchema(config: z.infer<typeof BillingSchema>) {
  return BillingSchema.parse(config);
}

export type BillingConfig = z.infer<typeof BillingSchema>;
export type ProductSchema = z.infer<typeof ProductSchema>;

export function getPlanIntervals(config: z.infer<typeof BillingSchema>) {
  const intervals = config.products
    .flatMap((product) => product.plans.map((plan) => plan.interval))
    .filter(Boolean);

  return Array.from(new Set(intervals));
}

export function getBaseLineItem(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      if (plan.id === planId) {
        const item = plan.lineItems.find((item) => item.type === 'base');

        if (item) {
          return item;
        }
      }
    }
  }

  throw new Error('Base line item not found');
}

export function getProductPlanPair(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      if (plan.id === planId) {
        return { product, plan };
      }
    }
  }

  throw new Error('Plan not found');
}

export function getProductPlanPairByVariantId(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      for (const lineItem of plan.lineItems) {
        if (lineItem.id === planId) {
          return { product, plan };
        }
      }
    }
  }

  throw new Error('Plan not found');
}

export function getLineItemTypeById(
  config: z.infer<typeof BillingSchema>,
  id: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      for (const lineItem of plan.lineItems) {
        if (lineItem.type === id) {
          return lineItem.type;
        }
      }
    }
  }

  throw new Error(`Line Item with ID ${id} not found`);
}
