import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { logoutFn } from "@/lib/auth.ts";

export const Route = createFileRoute("/_authenticated/protected")({
  component: RouteComponent,
});

function RouteComponent() {
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const navigate = Route.useNavigate();
  const { auth } = Route.useRouteContext();
  const user = auth.user;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutFn();
    } finally {
      setLoggingOut(false);
      navigate({
        to: "/",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1>Hello {user.name}</h1>
      <div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-red-500 text-red-50 py-3 px-2 rounded-md cursor-pointer"
        >
          {loggingOut ? "Signing you out ..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
