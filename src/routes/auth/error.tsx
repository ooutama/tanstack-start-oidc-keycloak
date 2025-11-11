import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/error")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-red-100 text-red-500 p-4">An error occurred while authenticating. Please try again later.</div>
  );
}
