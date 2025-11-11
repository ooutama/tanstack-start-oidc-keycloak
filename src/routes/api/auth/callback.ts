import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAppSession } from "@/lib/session";
import { authenticate } from "@/lib/auth.ts";

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const authorizationCode = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (authorizationCode == null || state == null) {
          throw redirect({ to: "/auth/error", replace: true });
        }

        const session = await getAppSession();
        if (session.data.status !== "authenticating" || session.data.state != state || !session.data.codeVerifier) {
          throw redirect({ to: "/auth/error", replace: true });
        }

        try {
          const sessionData = await authenticate(authorizationCode, session.data.codeVerifier);
          await session.clear();
          await session.update(sessionData);
        } catch (error) {
          await session.clear();
          throw redirect({ to: "/auth/error", replace: true });
        }

        throw redirect({ to: session.data.redirect ?? "/", replace: true });
      },
    },
  },
});
