
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Clean up any existing auth state before login
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Pre-login signout failed, continuing with login");
      }
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login Error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("User not found after successful login");
      }

      try {
        // Fetch user details from the 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // If we can't get the profile, create a basic user object from auth data
          const basicUser: User = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'User',
            email: data.user.email || email,
            role: (data.user.user_metadata?.role as UserRole) || 'tenant',
          };
          
          // Store user info in local storage
          localStorage.setItem('pg_finder_user', JSON.stringify(basicUser));
          
          return basicUser;
        }

        // Map the Supabase profile data to our User type
        const user: User = {
          id: profile.id,
          name: profile.full_name || 'Unknown User',
          email: profile.email || email,
          role: (profile.role as UserRole) || 'tenant',
        };

        // Store user info in local storage
        localStorage.setItem('pg_finder_user', JSON.stringify(user));
        console.log("Login successful, user stored:", user);
        return user;
      } catch (err) {
        console.error("Error in profile handling:", err);
        // Fallback to create a user from auth data
        const fallbackUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || 'User',
          email: data.user.email || email,
          role: (data.user.user_metadata?.role as UserRole) || 'tenant',
        };
        
        // Store user info in local storage
        localStorage.setItem('pg_finder_user', JSON.stringify(fallbackUser));
        
        return fallbackUser;
      }
    } catch (error) {
      console.error("Login failure:", error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    try {
      // Clean up any existing auth state before registration
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Pre-registration signout failed, continuing with registration");
      }
      
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            role: role
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        console.error("Signup Error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("User not found after successful registration");
      }

      // Insert user details into the 'profiles' table
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              email: email,
              role: role,
            },
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      } catch (err) {
        console.error("Error in profile creation:", err);
      }

      // Auto-login after registration
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
        if (signInError) {
          console.error("Auto-login failed:", signInError);
        } else {
          console.log("Auto-login successful:", signInData);
        }
      } catch (confirmErr) {
        console.log("Auto-login failed:", confirmErr);
      }

      const user: User = {
        id: data.user.id,
        name: name,
        email: email,
        role: role,
      };

      // Store user info in local storage
      localStorage.setItem('pg_finder_user', JSON.stringify(user));
      
      console.log("Registration successful, user stored:", user);
      return user;
    } catch (error) {
      console.error("Registration failure:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Clear all local storage items related to authentication first
      localStorage.removeItem('pg_finder_user');
      localStorage.removeItem('pgfinder_auth');
      
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt a global signout to clear all sessions from the server
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.error("Error during signout:", error);
        throw error;
      }
    } catch (error) {
      console.error("Logout failure:", error);
      
      // Even if there's an error, we should clear local storage
      localStorage.removeItem('pg_finder_user');
      localStorage.removeItem('pgfinder_auth');
      throw error;
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userString = localStorage.getItem('pg_finder_user');
      if (userString) {
        return JSON.parse(userString) as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
};
