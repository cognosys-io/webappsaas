'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  BillingConfig,
  getBaseLineItem,
  getPlanIntervals,
  getProductPlanPair,
} from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Label } from '@kit/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '@kit/ui/radio-group';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

export function PlanPicker(
  props: React.PropsWithChildren<{
    config: BillingConfig;
    onSubmit: (data: { planId: string; productId: string }) => void;
    pending?: boolean;
  }>,
) {
  const intervals = useMemo(
    () => getPlanIntervals(props.config),
    [props.config],
  ) as string[];

  const form = useForm({
    reValidateMode: 'onChange',
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          planId: z.string(),
          interval: z.string().min(1),
        })
        .refine(
          (data) => {
            try {
              const { product, plan } = getProductPlanPair(
                props.config,
                data.planId,
              );

              return product && plan;
            } catch {
              return false;
            }
          },
          { message: `Please pick a plan to continue`, path: ['planId'] },
        ),
    ),
    defaultValues: {
      interval: intervals[0],
      planId: '',
      productId: '',
    },
  });

  const { interval: selectedInterval } = form.watch();
  const planId = form.getValues('planId');

  const { plan: selectedPlan, product: selectedProduct } = useMemo(() => {
    try {
      return getProductPlanPair(props.config, planId);
    } catch {
      return {
        plan: null,
        product: null,
      };
    }
  }, [props.config, planId]);

  return (
    <Form {...form}>
      <div
        className={
          'flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0'
        }
      >
        <form
          className={'flex w-full max-w-xl flex-col space-y-4'}
          onSubmit={form.handleSubmit(props.onSubmit)}
        >
          <FormField
            name={'interval'}
            render={({ field }) => {
              return (
                <FormItem className={'rounded-md border p-4'}>
                  <FormLabel htmlFor={'plan-picker-id'}>
                    Choose your billing interval
                  </FormLabel>

                  <FormControl id={'plan-picker-id'}>
                    <RadioGroup name={field.name} value={field.value}>
                      <div className={'flex space-x-2.5'}>
                        {intervals.map((interval) => {
                          const selected = field.value === interval;

                          return (
                            <label
                              htmlFor={interval}
                              key={interval}
                              className={cn(
                                'hover:bg-muted flex items-center space-x-2 rounded-md border border-transparent px-4 py-2',
                                {
                                  ['border-border']: selected,
                                  ['hover:bg-muted']: !selected,
                                },
                              )}
                            >
                              <RadioGroupItem
                                id={interval}
                                value={interval}
                                onClick={() => {
                                  form.setValue('planId', '', {
                                    shouldValidate: true,
                                  });

                                  form.setValue('interval', interval, {
                                    shouldValidate: true,
                                  });
                                }}
                              />

                              <span className={'text-sm font-bold'}>
                                <Trans
                                  i18nKey={`common:billingInterval.${interval}`}
                                />
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={'planId'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pick your preferred plan</FormLabel>

                <FormControl>
                  <RadioGroup name={field.name}>
                    {props.config.products.map((product) => {
                      const plan = product.plans.find(
                        (item) => item.interval === selectedInterval,
                      );

                      if (!plan) {
                        return null;
                      }

                      const baseLineItem = getBaseLineItem(
                        props.config,
                        plan.id,
                      );

                      return (
                        <RadioGroupItemLabel
                          selected={field.value === plan.id}
                          key={plan.id}
                        >
                          <RadioGroupItem
                            id={plan.id}
                            value={plan.id}
                            onClick={() => {
                              form.setValue('planId', plan.id, {
                                shouldValidate: true,
                              });

                              form.setValue('productId', product.id, {
                                shouldValidate: true,
                              });
                            }}
                          />

                          <div
                            className={
                              'flex w-full items-center justify-between'
                            }
                          >
                            <Label
                              htmlFor={plan.id}
                              className={
                                'flex flex-col justify-center space-y-2'
                              }
                            >
                              <span className="font-bold">{product.name}</span>

                              <span className={'text-muted-foreground'}>
                                {product.description}
                              </span>
                            </Label>

                            <div
                              className={
                                'flex items-center space-x-4 text-right'
                              }
                            >
                              <If condition={plan.trialPeriod}>
                                <div>
                                  <Badge variant={'success'}>
                                    {plan.trialPeriod} day trial
                                  </Badge>
                                </div>
                              </If>

                              <div>
                                <Price key={plan.id}>
                                  <span>
                                    {formatCurrency(
                                      product.currency.toLowerCase(),
                                      baseLineItem.cost,
                                    )}
                                  </span>
                                </Price>

                                <div>
                                  <span className={'text-muted-foreground'}>
                                    per {selectedInterval}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </RadioGroupItemLabel>
                      );
                    })}
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button disabled={props.pending ?? !form.formState.isValid}>
              {props.pending ? (
                'Processing...'
              ) : (
                <>
                  <If
                    condition={selectedPlan?.trialPeriod}
                    fallback={'Proceed to payment'}
                  >
                    <span>Start {selectedPlan?.trialPeriod} day trial</span>
                  </If>

                  <ArrowRight className={'ml-2 h-4 w-4'} />
                </>
              )}
            </Button>
          </div>
        </form>

        <If condition={selectedPlan && selectedProduct}>
          <div
            className={
              'fade-in animate-in zoom-in-90 flex w-full flex-col space-y-4 rounded-lg border p-4'
            }
          >
            <div className={'flex flex-col space-y-0.5'}>
              <Heading level={5}>
                <b>{selectedProduct?.name}</b>
              </Heading>

              <p>
                <span className={'text-muted-foreground'}>
                  {selectedProduct?.description}
                </span>
              </p>
            </div>

            <div className={'flex flex-col space-y-1'}>
              <span className={'font-semibold'}>Details</span>

              <div className={'flex flex-col divide-y'}>
                {selectedPlan?.lineItems.map((item) => {
                  switch (item.type) {
                    case 'base':
                      return (
                        <div
                          key={item.id}
                          className={
                            'flex items-center justify-between py-1.5 text-sm'
                          }
                        >
                          <span>{item.name}</span>
                          <span className={'font-semibold'}>
                            {formatCurrency(
                              selectedProduct?.currency.toLowerCase(),
                              item.cost,
                            )}
                          </span>
                        </div>
                      );

                    case 'per-seat':
                      return (
                        <div
                          key={item.id}
                          className={
                            'flex items-center justify-between py-1.5 text-sm'
                          }
                        >
                          <span>Per team member</span>
                          <span className={'font-semibold'}>
                            {formatCurrency(
                              selectedProduct?.currency.toLowerCase(),
                              item.cost,
                            )}
                          </span>
                        </div>
                      );

                    case 'metered':
                      return (
                        <div
                          key={item.id}
                          className={
                            'flex items-center justify-between py-1.5 text-sm'
                          }
                        >
                          <span>
                            Per {item.unit}
                            {item.included
                              ? ` (${item.included} included)`
                              : ''}
                          </span>
                          <span className={'font-semibold'}>
                            {formatCurrency(
                              selectedProduct?.currency.toLowerCase(),
                              item.cost,
                            )}
                          </span>
                        </div>
                      );
                  }
                })}
              </div>
            </div>

            <div className={'flex flex-col space-y-2'}>
              <span className={'font-semibold'}>Features</span>

              {selectedProduct?.features.map((item) => {
                return (
                  <div
                    key={item}
                    className={'flex items-center space-x-2 text-sm'}
                  >
                    <CheckCircle className={'h-4 text-green-500'} />

                    <span className={'text-muted-foreground'}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </If>
      </div>
    </Form>
  );
}

function Price(props: React.PropsWithChildren) {
  return (
    <span
      className={
        'animate-in slide-in-from-left-4 fade-in text-xl font-bold duration-500'
      }
    >
      {props.children}
    </span>
  );
}
