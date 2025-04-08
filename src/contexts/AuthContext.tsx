
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState, UserRole } from "../types";
import { authAPI } from "../services/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isTenant: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = authAPI.getCurrentUser();
        
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authAPI.login(email, password);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const user = await authAPI.register(name, email, password, role);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isOwner = () => {
    return authState.user?.role === 'owner';
  };

  const isTenant = () => {
    return authState.user?.role === 'tenant';
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        isOwner,
        isTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
