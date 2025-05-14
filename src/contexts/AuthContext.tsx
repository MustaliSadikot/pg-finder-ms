
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authAPI } from "../services/api";
import { generateUUID, isValidUUID } from "../utils/uuidHelper";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

// Helper function to clean up auth state in localStorage
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First get the current session from Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session) {
          console.log("Found existing session:", sessionData.session.user.email);
          
          // We have a valid session, try to get or create user data
          let currentUser = authAPI.getCurrentUser();
          
          if (!currentUser && sessionData.session.user) {
            // Create a user object from session data
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionData.session.user.id)
              .single();
              
            if (profile) {
              currentUser = {
                id: profile.id,
                name: profile.full_name || 'User',
                email: profile.email || sessionData.session.user.email || '',
                role: (profile.role as UserRole) || 'tenant'
              };
              
              // Store in local storage
              localStorage.setItem('pg_finder_user', JSON.stringify(currentUser));
            }
          }
          
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
        } else {
          // No valid session
          cleanupAuthState();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
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

  // Listen for auth state changes from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          // Update the user state when signed in
          setTimeout(async () => {
            const user = authAPI.getCurrentUser();
            if (user) {
              setState({
                user,
                isAuthenticated: true,
                isLoading: false
              });
            } else if (session.user) {
              // Try to get from profiles
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                  
                if (profile) {
                  const newUser = {
                    id: profile.id,
                    name: profile.full_name || 'User',
                    email: profile.email || session.user.email || '',
                    role: (profile.role as UserRole) || 'tenant'
                  };
                  
                  // Store in local storage
                  localStorage.setItem('pg_finder_user', JSON.stringify(newUser));
                  
                  setState({
                    user: newUser,
                    isAuthenticated: true,
                    isLoading: false
                  });
                }
              } catch (err) {
                console.error("Error fetching profile:", err);
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear user state when signed out
          cleanupAuthState();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Clean up existing auth state before login
      cleanupAuthState();
      
      // Attempt login
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
    } catch (error: any) {
      console.error("Login error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error?.message || "Invalid email or password. Please try again.";
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Clean up existing auth state before registration
      cleanupAuthState();
      
      // Register and automatically log in
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
    } catch (error: any) {
      console.error("Registration error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error?.message || "Could not create your account. Please try again.";
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Perform logout
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
