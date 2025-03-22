import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend the user schema for form validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(4, "Password must be at least 4 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Path of the error
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [formType, setFormType] = useState<"login" | "register">("login");
  const [location, navigate] = useLocation();
  
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  
  // Redirect to home if already logged in
  useEffect(() => {
    console.log("AuthPage - User state:", user);
    console.log("AuthPage - Current location:", location);
    
    if (user) {
      console.log("AuthPage - User is logged in, redirecting to home");
      navigate("/");
    } else {
      console.log("AuthPage - User is not logged in, staying on auth page");
    }
  }, [user, navigate, location]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    console.log("Login submission:", data);
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    console.log("Register submission:", data);
    // Remove confirmPassword as it's not in the API schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to Hkitchen
            </h1>
            <p className="text-muted-foreground">
              Your smart kitchen companion that transforms ingredient management into a delightful culinary experience.
            </p>
          </div>
          
          <Tabs defaultValue="login" className="w-full" onValueChange={(v) => setFormType(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>
                    Enter your username and password to access your kitchen inventory
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Your username" 
                        {...loginForm.register("username")} 
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        {...loginForm.register("password")} 
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-2" />
                      )}
                      Log In
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Register to start managing your kitchen inventory
                  </CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        placeholder="Choose a username" 
                        {...registerForm.register("username")} 
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        {...registerForm.register("password")} 
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        {...registerForm.register("confirmPassword")} 
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Register
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:flex flex-col justify-center">
          <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                Smart Kitchen Assistant
              </div>
              <h3 className="text-2xl font-bold">Simplify Your Cooking Life</h3>
              <p className="text-muted-foreground">
                Track your ingredients and discover delicious recipes that you can make with what you have on hand. No more wasted food or last-minute grocery runs.
              </p>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">AI-Powered Recipe Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recipe recommendations based on the ingredients in your inventory.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">Save Your Favorites</h4>
                  <p className="text-sm text-muted-foreground">
                    Bookmark recipes you love to easily find them again later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}