
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    // Fetch user details from the 'profiles' table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw profileError;
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

    return user;
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    // Insert user details into the 'profiles' table
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
      throw profileError;
    }

    const user: User = {
      id: data.user.id,
      name: name,
      email: email,
      role: role,
    };

    // Store user info in local storage
    localStorage.setItem('pg_finder_user', JSON.stringify(user));

    return user;
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // Remove user info from local storage
    localStorage.removeItem('pg_finder_user');
  },

  getCurrentUser: (): User | null => {
    const userString = localStorage.getItem('pg_finder_user');
    if (userString) {
      return JSON.parse(userString) as User;
    }
    return null;
  },
};
