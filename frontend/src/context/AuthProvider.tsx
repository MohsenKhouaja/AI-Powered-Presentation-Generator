import { jwtDecode, type JwtPayload } from "jwt-decode";
import { useState } from "react";
import type { ReactNode } from "react";
import authContext from "./AuthContext";
import { parseValidationErrorMessage } from "@/lib/dto/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function extractAccessToken(payload: unknown): string | null {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const candidate =
      (payload as { accessToken?: unknown }).accessToken ??
      (payload as { accesToken?: unknown }).accesToken;
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expiration, setExpiration] = useState<number | null>(null);
  //TODO el refresh matemchi ken ki nab3eth request w nfaili, n7eb nrefreshi in a smarter way
  const fetchToken = async (
    path: string,
    options: object,
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
        let errorMessage = `${response.status}: ${response.statusText}`;
        try {
          const errorPayload = await response.json();
          errorMessage =
            parseValidationErrorMessage(errorPayload) ?? errorMessage;
        } catch (parseError) {
          console.error("Failed to parse auth error payload", parseError);
        }
        setToken(null);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
      const tokenPayload = await response.json();
      const parsedToken = extractAccessToken(tokenPayload);
      setIsLoading(false);
      try {
        if (!parsedToken) {
          throw Error("token is missing");
        }
        const decodedJWT = jwtDecode<JwtPayload>(parsedToken);
        setToken(parsedToken);
        setExpiration(decodedJWT.exp || null);
        setIsLoggedIn(true);
        return parsedToken;
      } catch (error) {
        console.log("token error: ", error);
        return null;
      }
    } catch (error) {
      console.log("error: ", error);
      setIsLoading(false);
      return null;
    }
  };
  const login = async (email: string, password: string) => {
    console.log("login called");
    const nextToken = await fetchToken("login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
    if (!nextToken) {
      throw new Error("Unable to sign in");
    }
  };
  const register = async (email: string, password: string) => {
    console.log("signup called");
    const nextToken = await fetchToken("register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });
    if (!nextToken) {
      throw new Error("Unable to create account");
    }
  };
  const refresh = async () => {
    console.log("refresh called");
    try {
      const newToken = await fetchToken("refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!newToken) {
        logout();
      }
      return newToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setExpiration(null);
  };

  const fetchwithauth = async (
    path: string,
    method: HttpMethod,
    options?: RequestInit,
  ): Promise<Response> => {
    const requestHeaders = new Headers(options?.headers);
    const isFormDataBody = options?.body instanceof FormData;
    if (!isFormDataBody && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    let newToken = token;
    if (expiration && Date.now() >= expiration * 1000) {
      newToken = await refresh();
    }

    requestHeaders.set("Authorization", `Bearer ${newToken}`);

    let response = await fetch(`${path}`, {
      method,
      ...options,
      headers: requestHeaders,
    });

    if (response.status === 401) {
      newToken = await refresh();
      const retryHeaders = new Headers(options?.headers);
      if (!isFormDataBody && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${path}`, {
        method,
        ...options,
        headers: retryHeaders,
      });
    }

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`,
      );
    }
    return response;
  };
  return (
    <authContext.Provider
      value={{
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        token,
        fetchwithauth,
        setEmail,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
