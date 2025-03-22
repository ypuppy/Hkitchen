import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  QueryClient
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the context type
interface AuthContextValue {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
}

// Define login input type
interface LoginInput {
  username: string;
  password: string;
}

// Create context with a default value of null
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider component
function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn<SelectUser>({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation<SelectUser, Error, LoginInput>({
    mutationFn: async (credentials) => {
      console.log("Login mutation called with:", credentials);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Login failed with status:", res.status, errorText);
          throw new Error(errorText || "Login failed. Please check your credentials.");
        }
        const userData = await res.json();
        console.log("Login successful, received user data:", userData);
        return userData;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (userData) => {
      console.log("Login mutation success, setting user data:", userData);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<SelectUser, Error, InsertUser>({
    mutationFn: async (userData) => {
      console.log("Register mutation called with:", userData);
      try {
        const res = await apiRequest("POST", "/api/register", userData);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Registration failed with status:", res.status, errorText);
          throw new Error(errorText || "Registration failed. Please try a different username.");
        }
        const newUserData = await res.json();
        console.log("Registration successful, received user data:", newUserData);
        return newUserData;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (userData) => {
      console.log("Registration mutation success, setting user data:", userData);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.username}!`,
      });
    },
    onError: (error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Invalidate all queries to force refetch when logged back in
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create context value
  const contextValue: AuthContextValue = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };