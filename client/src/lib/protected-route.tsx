import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  
  console.log("ProtectedRoute - Path:", path);
  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - isLoading:", isLoading);

  if (isLoading) {
    console.log("ProtectedRoute - Showing loading spinner");
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - Redirecting to /auth");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  console.log("ProtectedRoute - Rendering protected component");
  return <Route path={path} component={Component} />;
}