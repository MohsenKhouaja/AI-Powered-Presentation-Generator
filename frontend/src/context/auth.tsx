import { createContext, useContext } from "react";

export type AuthContextValue = {
  setEmail: (value: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
};

const authContext = createContext<AuthContextValue>({
  setEmail: () => {},
  isLoading: false,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  token: null,
});
export function useAuth():AuthContextValue {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default authContext;
