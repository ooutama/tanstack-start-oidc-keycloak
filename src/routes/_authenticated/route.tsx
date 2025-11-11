import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthFn } from "@/lib/auth.ts";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const auth = await getAuthFn();
    if (!auth.authenticated) {
      throw redirect({
        to: "/",
        replace: true,
      });
    }
    return { auth };
  },
});
