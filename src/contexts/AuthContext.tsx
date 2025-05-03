
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authAPI } from "../services/api";
import { generateUUID, isValidUUID } from "../utils/uuidHelper";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isOwner: () => boolean;
  isTenant: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  isOwner: () => false,
  isTenant: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        
        // Ensure user has a properly formatted UUID
        if (currentUser && (!currentUser.id || !isValidUUID(currentUser.id))) {
          currentUser.id = generateUUID();
          // Update user in local storage with proper UUID
          localStorage.setItem('pg_finder_user', JSON.stringify(currentUser));
        }
        
        setState({
          user: currentUser,
          isAuthenticated: !!currentUser,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authAPI.login(email, password);
      
      // Ensure user has a properly formatted UUID
      if (user && (!user.id || !isValidUUID(user.id))) {
        user.id = generateUUID();
        // Update user in local storage with proper UUID
        localStorage.setItem('pg_finder_user', JSON.stringify(user));
      }
      
      setState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Set auth token in localStorage for use with protected routes
      localStorage.setItem('pgfinder_auth', 'authenticated');
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authAPI.register(name, email, password, role);
      
      // Ensure user has a properly formatted UUID
      if (user && (!user.id || !isValidUUID(user.id))) {
        user.id = generateUUID();
        // Update user in local storage with proper UUID
        localStorage.setItem('pg_finder_user', JSON.stringify(user));
      }
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Set auth token in localStorage for use with protected routes
      localStorage.setItem('pgfinder_auth', 'authenticated');
      
      toast({
        title: "Registration Successful",
        description: `Welcome to PG Finder, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Registration Failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await authAPI.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Remove auth token from localStorage
      localStorage.removeItem('pgfinder_auth');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Logout Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isOwner = () => {
    return state.user?.role === 'owner';
  };

  const isTenant = () => {
    return state.user?.role === 'tenant';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        login, 
        register, 
        logout, 
        isOwner,
        isTenant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
