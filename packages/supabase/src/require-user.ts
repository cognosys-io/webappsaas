import type { SupabaseClient, User } from '@supabase/supabase-js';

import { z } from 'zod';

import { checkRequiresMultiFactorAuthentication } from './check-requires-mfa';

const MULTI_FACTOR_AUTH_VERIFY_PATH = z
  .string()
  .default('/auth/verify')
  .parse(process.env.MULTI_FACTOR_AUTH_VERIFY_PATH);

const SIGN_IN_PATH = z
  .string()
  .default('/auth/sign-in')
  .parse(process.env.SIGN_IN_PATH);

/**
 * @name requireUser
 * @description Require a session to be present in the request
 * @param client
 */
export async function requireUser(client: SupabaseClient): Promise<
  | {
      error: null;
      data: User;
    }
  | (
      | {
          error: AuthenticationError;
          data: null;
          redirectTo: string;
        }
      | {
          error: MultiFactorAuthError;
          data: null;
          redirectTo: string;
        }
    )
> {
  const { data, error } = await client.auth.getUser();

  if (!data.user || error) {
    return {
      data: null,
      error: new AuthenticationError(),
      redirectTo: SIGN_IN_PATH,
    };
  }

  const requiresMfa = await checkRequiresMultiFactorAuthentication(client);

  // If the user requires multi-factor authentication,
  // redirect them to the page where they can verify their identity.
  if (requiresMfa) {
    return {
      data: null,
      error: new MultiFactorAuthError(),
      redirectTo: MULTI_FACTOR_AUTH_VERIFY_PATH,
    };
  }

  return {
    error: null,
    data: data.user,
  };
}

class AuthenticationError extends Error {
  constructor() {
    super(`Authentication required`);
  }
}

class MultiFactorAuthError extends Error {
  constructor() {
    super(`Multi-factor authentication required`);
  }
}