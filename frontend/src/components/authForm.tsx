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
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/hooks/queries/useAuthSession";
export function AuthForm() {
  const { setEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const activeMutation = mode === "login" ? loginMutation : registerMutation;
  const pending = activeMutation.isPending;
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
    const credentials = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    if (!credentials.email || !credentials.password) {
      setFormError("Email and password are required");
      return;
    }

    setFormError(null);
    const { email, password } = credentials;
    setEmail(email);
    if (mode === "login") {
      await loginMutation
        .mutateAsync({ email, password })
        .catch(() => undefined);
    } else {
      await registerMutation
        .mutateAsync({ email, password })
        .catch(() => undefined);
    }
  };
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Tabs
        value={mode}
        onValueChange={changeMode}
        className="w-full max-w-[400px] flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 shrink-0 text-sm">
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
          <Card className="border bg-card h-full flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your email to sign in to your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="bg-background/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="bg-background/50"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <div className="w-full space-y-2">
                  {formError ? (
                    <p id="login-error" role="alert" className="text-sm text-destructive">{formError}</p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={pending}
                    aria-describedby={formError ? "login-error" : undefined}
                  >
                    {pending ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup" className="flex-1 mt-0">
          <Card className="border bg-card h-full flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-background/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    className="bg-background/50"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-6">
                <div className="w-full space-y-2">
                  {formError ? (
                    <p id="signup-error" role="alert" className="text-sm text-destructive">{formError}</p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={pending}
                    aria-describedby={formError ? "signup-error" : undefined}
                  >
                    {pending ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
