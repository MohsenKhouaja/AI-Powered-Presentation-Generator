import { createContext, useContext } from "react";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type AuthContextValue = {
  setEmail: (value: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  fetchwithauth: (
    path: string,
    method: HttpMethod,
    options?: object,
  ) => Promise<Response>;
};

const authContext = createContext<AuthContextValue | null>(null);
export function useAuth(): AuthContextValue {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default authContext;
