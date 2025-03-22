import { ChefHat, Utensils, Sparkles, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  const handleLogout = () => {
    console.log("Logging out...");
    logoutMutation.mutate();
    // Note: The redirect to /auth will be handled by ProtectedRoute
  };
  
  const handleGoToAuth = () => {
    console.log("Redirecting to auth page");
    navigate("/auth");
  };
  
  return (
    <header className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow-sm p-4 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative mr-3">
            <ChefHat className="h-10 w-10 text-primary" />
            <Utensils className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              Kitchen Companion
            </h1>
            <p className="text-xs text-neutral-500">Your smart recipe assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">
              <User className="h-4 w-4 text-primary" />
              <p className="text-sm text-neutral-600">{user.username}</p>
            </div>
          )}
          
          <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-100">
            <Sparkles className="h-4 w-4 text-amber-400 mr-1" />
            <p className="text-sm text-neutral-600">Powered by OpenAI GPT-4o</p>
          </div>
          
          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <span>Logging out...</span>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </>
              )}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGoToAuth}
            >
              <User className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
