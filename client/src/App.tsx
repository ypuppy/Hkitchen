import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useEffect } from "react";

// Router with explicit routes and debugging
function Router() {
  const [location, setLocation] = useLocation();
  
  console.log("Current location:", location);
  
  // Force redirect to /auth if needed
  useEffect(() => {
    console.log("Router useEffect - current location:", location);
    
    // If we're at root and need login, this will be handled by ProtectedRoute
    if (location !== "/" && location !== "/auth" && !location.startsWith("/recipes/")) {
      console.log("Router - redirecting to /auth");
      setLocation("/auth");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      
      {/* Explicit auth route with debugging */}
      <Route path="/auth">
        {() => {
          console.log("Rendering Auth Page");
          return <AuthPage />;
        }}
      </Route>
      
      <Route>
        {() => {
          console.log("Rendering NotFound Page");
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
