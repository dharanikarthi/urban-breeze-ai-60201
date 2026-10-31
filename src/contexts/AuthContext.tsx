import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthUser, getSession, logOut as authLogOut } from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on every page load / reload
    const session = getSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const logout = () => {
    authLogOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
