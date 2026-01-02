import { jwtDecode } from "jwt-decode";
import {  useState } from "react";
import type { ReactNode } from "react";
import authContext from "./auth";

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
        const decodedJWT = jwtDecode(token);
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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
