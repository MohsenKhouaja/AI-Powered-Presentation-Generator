import { jwtDecode, type JwtPayload } from "jwt-decode";
import { useState } from "react";
import type { ReactNode } from "react";
import authContext from "./auth";
import { ReceiptEuro } from "lucide-react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expiration, setExpiration] = useState<number | null>(null);
  //TODO el refresh matemchi ken ki nab3eth request w nfaili, n7eb nrefreshi in a smarter way
  const fetchToken = async (
    path: string,
    options: object
  ): Promise<string | null> => {
    try {
      if (isLoading) {
        return null;
      }
      setIsLoading(true);
      const response = await fetch(`/api/auth/${path}`, {
        ...options,
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      const token = await response.json();
      setIsLoading(false);
      try {
        if (!token) {
          throw Error("token is missing");
        }
        const decodedJWT = jwtDecode<JwtPayload>(token);
        setToken(token);
        setExpiration(decodedJWT.exp || null);
        setIsLoggedIn(true);
      } catch (error) {
        console.log("token error: ", error);
      }
      return token;
    } catch (error) {
      console.log("error: ", error);
      setIsLoading(false);
      return null;
    }
  };
  const login = async (email: string, password: string) => {
    console.log("login called");
    await fetchToken("login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
  };
  const register = async (email: string, password: string) => {
    console.log("signup called");
    await fetchToken("register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
  };
  const refresh = async () => {
    console.log("refresh called");
    await fetchToken("refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };
  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setEmail("");
    setExpiration(null);
  };
  //TODO add middleware fetchwithauth
  // https://chat.deepseek.com/a/chat/s/342c88a8-7320-4023-ba0e-105ea9afb338
  // https://chat.deepseek.com/a/chat/s/430790bf-3fe7-42bf-8cbf-0f175a925be9
  return (
    <authContext.Provider
      value={{
        setEmail,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        token,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
