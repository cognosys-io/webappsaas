import 'server-only';

import { type EmailOtpType, SupabaseClient } from '@supabase/supabase-js';

/**
 * @name createAuthCallbackService
 * @description Creates an instance of the AuthCallbackService
 * @param client
 */
export function createAuthCallbackService(client: SupabaseClient) {
  return new AuthCallbackService(client);
}

/**
 * @name AuthCallbackService
 * @description Service for handling auth callbacks in Supabase
 */
class AuthCallbackService {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * @name verifyTokenHash
   * @description Verifies the token hash and type and redirects the user to the next page
   * This should be used when using a token hash to verify the user's email
   * @param request
   * @param params
   */
  async verifyTokenHash(
    request: Request,
    params: {
      joinTeamPath: string;
      redirectPath: string;
      errorPath?: string;
    },
  ): Promise<URL> {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const host = request.headers.get('host');

    // set the host to the request host since outside of Vercel it gets set as "localhost"
    if (url.host.includes('localhost:') && !host?.includes('localhost')) {
      url.host = host as string;
      url.port = '';
    }

    url.pathname = params.redirectPath;

    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const callbackParam = searchParams.get('next') ?? searchParams.get('callback');

    let nextPath: string | null = null;
    const callbackUrl = callbackParam ? new URL(callbackParam) : null;

    // if we have a callback url, we check if it has a next path
    if (callbackUrl) {
      // if we have a callback url, we check if it has a next path
      const callbackNextPath = callbackUrl.searchParams.get('next');

      // if we have a next path in the callback url, we use that
      if (callbackNextPath) {
        nextPath = callbackNextPath;
      } else {
        nextPath = callbackUrl.pathname;
      }
    }

    const inviteToken = callbackUrl?.searchParams.get('invite_token');
    const errorPath = params.errorPath ?? '/auth/callback/error';

    // remove the query params from the url
    searchParams.delete('token_hash');
    searchParams.delete('type');
    searchParams.delete('next');
    searchParams.delete('callback');

    // if we have a next path, we redirect to that path
    if (nextPath) {
      url.pathname = nextPath;
    }

    // if we have an invite token, we append it to the redirect url
    if (inviteToken) {
      // if we have an invite token, we redirect to the join team page
      // instead of the default next url. This is because the user is trying
      // to join a team and we want to make sure they are redirected to the
      // correct page.
      url.pathname = params.joinTeamPath;
      searchParams.set('invite_token', inviteToken);

      const emailParam = callbackUrl?.searchParams.get('email');

      if (emailParam) {
        searchParams.set('email', emailParam);
      }
    }

    if (token_hash && type) {
      const { error } = await this.client.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return url;
      }
    }

    // return the user to an error page with some instructions
    url.pathname = errorPath;

    return url;
  }

  /**
   * @name exchangeCodeForSession
   * @description Exchanges the auth code for a session and redirects the user to the next page or an error page
   * @param request
   * @param params
   */
  async exchangeCodeForSession(
    request: Request,
    params: {
      joinTeamPath: string;
      redirectPath: string;
      errorPath?: string;
    },
  ): Promise<{
    nextPath: string;
  }> {
    const requestUrl = new URL(request.url);
    const searchParams = requestUrl.searchParams;

    const authCode = searchParams.get('code');
    const error = searchParams.get('error');
    const nextUrlPathFromParams = searchParams.get('next');
    const inviteToken = searchParams.get('invite_token');
    const errorPath = params.errorPath ?? '/auth/callback/error';

    let nextUrl = nextUrlPathFromParams ?? params.redirectPath;

    // if we have an invite token, we redirect to the join team page
    // instead of the default next url. This is because the user is trying
    // to join a team and we want to make sure they are redirected to the
    // correct page.
    if (inviteToken) {
      const emailParam = searchParams.get('email');

      const urlParams = new URLSearchParams({
        invite_token: inviteToken,
        email: emailParam ?? '',
      });

      nextUrl = `${params.joinTeamPath}?${urlParams.toString()}`;
    }

    if (authCode) {
      try {
        const { error } =
          await this.client.auth.exchangeCodeForSession(authCode);

        // if we have an error, we redirect to the error page
        if (error) {
          return onError({
            error: error.message,
            path: errorPath,
          });
        }
      } catch (error) {
        console.error(
          {
            error,
            name: `auth.callback`,
          },
          `An error occurred while exchanging code for session`,
        );

        const message = error instanceof Error ? error.message : error;

        return onError({
          error: message as string,
          path: errorPath,
        });
      }
    }

    if (error) {
      return onError({
        error,
        path: errorPath,
      });
    }

    return {
      nextPath: nextUrl,
    };
  }
}

function onError({ error, path }: { error: string; path: string }) {
  const errorMessage = getAuthErrorMessage(error);

  console.error(
    {
      error,
      name: `auth.callback`,
    },
    `An error occurred while signing user in`,
  );

  const nextPath = `${path}?error=${errorMessage}`;

  return {
    nextPath,
  };
}

/**
 * Checks if the given error message indicates a verifier error.
 * We check for this specific error because it's highly likely that the
 * user is trying to sign in using a different browser than the one they
 * used to request the sign in link. This is a common mistake, so we
 * want to provide a helpful error message.
 */
function isVerifierError(error: string) {
  return error.includes('both auth code and code verifier should be non-empty');
}

function getAuthErrorMessage(error: string) {
  return isVerifierError(error)
    ? `auth:errors.codeVerifierMismatch`
    : `auth:authenticationErrorAlertBody`;
}
