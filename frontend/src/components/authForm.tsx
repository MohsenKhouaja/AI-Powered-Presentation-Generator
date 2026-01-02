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
import { useAuth } from "@/context/auth";
import { useState } from "react";
export function AuthForm() {
  const { setEmail, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const changeMode = () => {
    if (mode === "login") {
      setMode("signup");
    } else {
      setMode("login");
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setEmail(email);
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Tabs
        value={mode}
        onValueChange={changeMode}
        className="w-full max-w-[400px] min-h-[500px] flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 shrink-0">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="flex-1 mt-0">
          <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email to sign in to your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground/80"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-background/50 border-border focus:ring-primary h-11"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground/80"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="bg-background/50 border-border focus:ring-primary h-11"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <Button
                  className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup" className="flex-1 mt-0">
          <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground/80"
                  >
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-background/50 h-11"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium uppercase tracking-wider text-muted-foreground/80"
                  >
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    className="bg-background/50 h-11"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <Button
                  className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
