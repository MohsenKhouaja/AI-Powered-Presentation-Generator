import { jwtDecode, type JwtPayload } from "jwt-decode";
import { useState } from "react";
import type { ReactNode } from "react";
import authContext from "./auth";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
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
        setToken(null);
        setIsLoading(false);
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      const tokenData = await response.json();
      setIsLoading(false);
      try {
        if (!tokenData) {
          throw Error("token is missing");
        }
        const decodedJWT = jwtDecode<JwtPayload>(tokenData);
        setToken(tokenData);
        setExpiration(decodedJWT.exp || null);
        setIsLoggedIn(true);
        return tokenData;
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
    options?: object
  ): Promise<Response> => {
    let newToken = token;
    if (expiration && Date.now() >= expiration * 1000) {
      newToken = await refresh();
    }
    let response = await fetch(`${path}`, {
      method: method,
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...(options as any)?.headers,
      },
    });
    if (response.status == 401) {
      newToken = await refresh();
      response = await fetch(`${path}`, {
        method: method,
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...(options as any)?.headers,
        },
      });
    }
    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`
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
