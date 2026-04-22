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
import { parseAuthCredentialsInput } from "@/lib/dto/auth";
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
  const mutationError = activeMutation.error;
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

    const parsedCredentials = parseAuthCredentialsInput(credentials);
    if (!parsedCredentials.success) {
      setFormError(
        parsedCredentials.error.issues[0]?.message ?? "Invalid form",
      );
      return;
    }

    setFormError(null);
    const { email, password } = parsedCredentials.data;
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Tabs
        value={mode}
        onValueChange={changeMode}
        className="w-full max-w-[400px] min-h-[500px] flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 shrink-0 text-[clamp(12px,1rem,18px)]">
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
              <CardTitle className="text-[clamp(20px,2xl,32px)] font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-[clamp(12px,1rem,18px)] text-muted-foreground">
                Enter your email to sign in to your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-[clamp(10px,sm,16px)] font-medium uppercase tracking-wider text-muted-foreground/80"
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
                    className="text-[clamp(10px,sm,16px)] font-medium uppercase tracking-wider text-muted-foreground/80"
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
                <div className="w-full space-y-2">
                  {formError ? (
                    <p className="text-sm text-destructive">{formError}</p>
                  ) : null}
                  {mutationError && !formError ? (
                    <p className="text-sm text-destructive">
                      {mutationError instanceof Error
                        ? mutationError.message
                        : "Unable to sign in"}
                    </p>
                  ) : null}
                  <Button
                    className="w-full h-11 text-[clamp(14px,base,20px)] font-semibold transition-all active:scale-[0.98]"
                    disabled={pending}
                  >
                    {pending ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup" className="flex-1 mt-0">
          <Card className="shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="text-[clamp(20px,2xl,32px)] font-bold tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="text-[clamp(12px,1rem,18px)] text-muted-foreground">
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className="flex-1 flex flex-col">
              <CardContent className="grid gap-4 flex-1">
                <div className="grid gap-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-[clamp(10px,sm,16px)] font-medium uppercase tracking-wider text-muted-foreground/80"
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
                    className="text-[clamp(10px,sm,16px)] font-medium uppercase tracking-wider text-muted-foreground/80"
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
                <div className="w-full space-y-2">
                  {formError ? (
                    <p className="text-sm text-destructive">{formError}</p>
                  ) : null}
                  {mutationError && !formError ? (
                    <p className="text-sm text-destructive">
                      {mutationError instanceof Error
                        ? mutationError.message
                        : "Unable to create account"}
                    </p>
                  ) : null}
                  <Button
                    className="w-full h-11 text-[clamp(14px,base,20px)] font-semibold transition-all active:scale-[0.98]"
                    disabled={pending}
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
