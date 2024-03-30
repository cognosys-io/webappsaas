'use client';

import { useState, useTransition } from 'react';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { EmbeddedCheckout, PlanPicker } from '@kit/billing-gateway/components';
import { Alert, AlertTitle } from '@kit/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';

import { createPersonalAccountCheckoutSession } from '../server-actions';

export function PersonalAccountCheckoutForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [checkoutToken, setCheckoutToken] = useState<string>();

  // If the checkout token is set, render the embedded checkout component
  if (checkoutToken) {
    return (
      <EmbeddedCheckout
        checkoutToken={checkoutToken}
        provider={billingConfig.provider}
      />
    );
  }

  // Otherwise, render the plan picker component
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Manage your Plan</CardTitle>

          <CardDescription>
            You can change your plan at any time.
          </CardDescription>
        </CardHeader>

        <CardContent className={'space-y-4'}>
          <If condition={error}>
            <ErrorAlert />
          </If>

          <PlanPicker
            pending={pending}
            config={billingConfig}
            onSubmit={({ planId, productId }) => {
              startTransition(async () => {
                try {
                  const { checkoutToken } =
                    await createPersonalAccountCheckoutSession({
                      planId,
                      productId,
                    });

                  setCheckoutToken(checkoutToken);
                } catch (e) {
                  setError(true);
                }
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'common:genericError'} />
      </AlertTitle>
    </Alert>
  );
}
