import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAppSession } from "@/lib/session";
import { generateCodeVerifier, generateState } from "arctic";
import { createAuthorizationURL } from "@/lib/auth.ts";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const authorizationUrl = createAuthorizationURL(state, codeVerifier);

        const session = await getAppSession();
        await session.update({
          status: "authenticating",
          state,
          codeVerifier,
          redirect: new URL(request.url).searchParams.get("redirect"),
        });

        throw redirect({
          href: authorizationUrl.toString(),
          replace: true,
        });
      },
    },
  },
});
