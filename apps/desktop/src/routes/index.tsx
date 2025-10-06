import { useAuth } from "@desktop/hooks/use-auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { authenticated } = useAuth();

  useEffect(() => {
    if (!authenticated) {
      navigate({ to: "/auth/register", replace: true });
    } else {
      navigate({ to: "/app", replace: true });
    }
  }, [navigate, authenticated]);

  return null;
}
