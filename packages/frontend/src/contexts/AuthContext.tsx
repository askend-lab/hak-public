"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { validateIsikukood, getNameFromIsikukood } from "@/utils/isikukood";

export interface User {
  id: string; // Isikukood
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (isikukood: string) => Promise<void>;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("eki_user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Validate the stored user data
          if (userData && userData.id && validateIsikukood(userData.id)) {
            setUser(userData);
          } else {
            // Clear invalid stored user
            localStorage.removeItem("eki_user");
          }
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
        localStorage.removeItem("eki_user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (isikukood: string): Promise<void> => {
    // Validate Isikukood
    if (!validateIsikukood(isikukood)) {
      throw new Error("Vigane isikukood");
    }

    // Simulate eID authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // First, try to find user in mock database
      const response = await fetch("/data/mock-users.json");
      const data = await response.json();

      let userData = data.users.find((u: User) => u.id === isikukood);

      if (!userData) {
        // If not in mock database, create a new user
        userData = {
          id: isikukood,
          name: getNameFromIsikukood(isikukood),
          email: `${isikukood.substring(0, 6)}@eesti.ee`,
        };
      }

      // Store user in localStorage
      localStorage.setItem("eki_user", JSON.stringify(userData));
      setUser(userData);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Sisselogimine ebaõnnestus");
    }
  };

  const logout = () => {
    localStorage.removeItem("eki_user");
    // Clear all user-specific localStorage data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("eki_task_") || key.startsWith("eki_user_tasks_")) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
