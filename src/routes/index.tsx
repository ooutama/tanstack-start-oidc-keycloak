import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <header className="bg-gray-100">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-black tracking-tight uppercase">Application</h1>
          <a href="/api/auth/login" className="font-medium hover:underline">
            Login
          </a>
        </div>
      </header>
      <div className="container mx-auto">
        <h1 className="text-center">Home page</h1>
      </div>
    </div>
  );
}
