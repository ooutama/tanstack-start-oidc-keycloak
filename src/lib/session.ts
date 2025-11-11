import { useSession } from "@tanstack/react-start/server";
import { env } from "@/env.ts";

export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
};

type AuthenticatingAppSession = {
  status: "authenticating";
  state: string;
  codeVerifier: string;
  redirect: string | null;
};

type AuthenticatedAppSession = {
  status: "authenticated";
  user: User;
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string | null;
};

export type AppSession = AuthenticatingAppSession | AuthenticatedAppSession;

export function getAppSession() {
  return useSession<AppSession>({
    name: "application_session",
    password: env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30days
      path: "/",
    },
  });
}
