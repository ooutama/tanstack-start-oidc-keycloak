import { KeyCloak, OAuth2Tokens } from "arctic";
import * as jose from "jose";
import { AppSession, getAppSession, User } from "@/lib/session.ts";
import { createServerFn } from "@tanstack/react-start";
import { env } from "@/env.ts";

function createOidcInstance() {
  return new KeyCloak(env.IDP_URL, env.IDP_CLIENT_ID, env.IDP_CLIENT_SECRET, `${env.PUBLIC_URL}/api/auth/callback`);
}

export function createAuthorizationURL(state: string, codeVerifier: string): URL {
  const oidc = createOidcInstance();
  return oidc.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
}

async function validateAuthorizationCode(code: string, codeVerifier: string): Promise<OAuth2Tokens> {
  const oidc = createOidcInstance();
  return oidc.validateAuthorizationCode(code, codeVerifier);
}

type JWT = jose.JWTPayload & {
  sub: string;
  name: string;
  email: string;
  preferred_username: string;
};

export async function authenticate(code: string, codeVerifier: string): Promise<AppSession> {
  const tokens = await validateAuthorizationCode(code, codeVerifier);
  const idToken = jose.decodeJwt<JWT>(tokens.idToken());

  return {
    status: "authenticated",
    refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
    accessToken: tokens.accessToken(),
    accessTokenExpiresAt: tokens.accessTokenExpiresAt().getTime(),
    user: {
      id: idToken.sub,
      email: idToken.email,
      name: idToken.name,
      username: idToken.preferred_username,
    },
  };
}

export type Auth =
  | { authenticated: false }
  | {
      authenticated: true;
      user: User;
      accessToken: string;
    };

export const getAuthFn = createServerFn()
  .inputValidator((data?: { retry: number }) => data)
  .handler(async ({ data }): Promise<Auth> => {
    const retry = data?.retry ?? 0;
    if (retry >= 2) {
      // it means the refresh token request failed
      return { authenticated: false };
    }

    const session = await getAppSession();
    if (session.data.status !== "authenticated" || !session.data.accessTokenExpiresAt || !session.data.accessToken) {
      return { authenticated: false };
    }

    if (session.data.accessTokenExpiresAt >= Date.now() + 30 * 1_000) {
      // You should always hide the refresh token.
      return { authenticated: true, accessToken: session.data.accessToken, user: session.data.user! };
    }

    await refreshTokenFn();
    return await getAuthFn({
      data: {
        retry: retry + 1,
      },
    });
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAppSession();
  if (session.data.status !== "authenticated") {
    return;
  }

  try {
    if (session.data.refreshToken) {
      await createOidcInstance().revokeToken(session.data.refreshToken);
    }
  } finally {
    await session.clear();
  }
});

export const refreshTokenFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAppSession();
  if (session.data.status !== "authenticated" || !session.data.refreshToken) {
    return;
  }

  try {
    const refreshToken = session.data.refreshToken;
    const oidc = createOidcInstance();
    const tokens = await oidc.refreshAccessToken(refreshToken);
    await session.update({
      refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : refreshToken,
      accessToken: tokens.accessToken(),
      accessTokenExpiresAt: tokens.accessTokenExpiresAt().getTime(),
    });
  } catch {
    await session.clear();
  }
});
