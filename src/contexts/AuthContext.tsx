
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authAPI } from "../services/api";
import { generateUUID } from "../utils/uuidHelper";

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        
        // Ensure user has a properly formatted UUID
        if (currentUser && (!currentUser.id || currentUser.id.includes('user_'))) {
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
      if (user && (!user.id || user.id.includes('user_'))) {
        user.id = generateUUID();
        // Update user in local storage with proper UUID
        localStorage.setItem('pg_finder_user', JSON.stringify(user));
      }
      
      setState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authAPI.register(name, email, password, role);
      
      // Ensure user has a properly formatted UUID
      if (user && (!user.id || user.id.includes('user_'))) {
        user.id = generateUUID();
        // Update user in local storage with proper UUID
        localStorage.setItem('pg_finder_user', JSON.stringify(user));
      }
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
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
    } catch (error) {
      console.error("Logout error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
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
