import { User, PGListing, Booking, UserRole, FilterOptions } from '../types';
import { mockUsers, mockPGListings, mockBookings } from '../utils/mockData';
import { deleteImage } from './storage';
import { bedAPI } from './roomApi';
import { supabase } from '@/integrations/supabase/client';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USER_KEY = 'pg_finder_user';
const USERS_KEY = 'pg_finder_users';
const LISTINGS_KEY = 'pg_finder_listings';
const BOOKINGS_KEY = 'pg_finder_bookings';

const initializeStorage = () => {
  if (!localStorage.getItem(LISTINGS_KEY)) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(mockPGListings));
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mockBookings));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
};

initializeStorage();

const getAllUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveUser = (user: User): void => {
  const users = getAllUsers();
  const existingUserIndex = users.findIndex(u => u.email === user.email);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    
    const users = getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return user;
  },
  
  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    await delay(500);
    
    const users = getAllUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
    };
    
    saveUser(newUser);
    
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  },
  
  logout: async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem(USER_KEY);
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const pgListingsAPI = {
  getListings: async (): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },
  
  addListing: async (listing: Omit<PGListing, 'id'>): Promise<PGListing> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .insert(listing)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateListing: async (listing: PGListing): Promise<PGListing> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .update(listing)
      .eq('id', listing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getListingById: async (id: string): Promise<PGListing | null> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
  
  getOwnerListings: async (ownerId: string): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw error;
    return data || [];
  },
};

export const bookingsAPI = {
  getBookings: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        pg_listings (*),
        rooms (*),
        beds (*)
      `);
    
    if (error) throw error;
    return data || [];
  },
  
  addBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<Booking> => {
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('*, beds (*)')
      .single();
    
    if (bookingError) throw bookingError;

    // If the booking is completed (tenant leaves) or rejected, mark the bed as unoccupied
    if ((status === 'completed' || status === 'rejected') && bookingData.bed_id) {
      const { error: bedError } = await supabase
        .from('beds')
        .update({ 
          is_occupied: false,
          tenant_id: null
        })
        .eq('id', bookingData.bed_id);
      
      if (bedError) throw bedError;
    }

    // If the booking is confirmed, mark the bed as occupied
    if (status === 'confirmed' && bookingData.bed_id) {
      const { error: bedError } = await supabase
        .from('beds')
        .update({ 
          is_occupied: true,
          tenant_id: bookingData.tenant_id
        })
        .eq('id', bookingData.bed_id);
      
      if (bedError) throw bedError;
    }

    return bookingData;
  },
  
  getTenantBookings: async (tenantId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        pg_listings (*),
        rooms (*),
        beds (*)
      `)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return data || [];
  },
  
  getPGBookings: async (pgId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        pg_listings (*),
        rooms (*),
        beds (*)
      `)
      .eq('pg_id', pgId);
    
    if (error) throw error;
    return data || [];
  },
};

// Update room APIs to use Supabase
export const roomAPI = {
  getRoomsByPGId: async (pgId: string): Promise<Room[]> => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('pg_id', pgId);
    
    if (error) throw error;
    return data || [];
  },
  
  getRoomById: async (id: string): Promise<Room | null> => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
};

// Update bed APIs to use Supabase
export const bedAPI = {
  getBedsByRoomId: async (roomId: string): Promise<Bed[]> => {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .eq('room_id', roomId);
    
    if (error) throw error;
    return data || [];
  },
  
  getBedById: async (id: string): Promise<Bed | null> => {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
  
  updateBed: async (bed: Bed): Promise<Bed> => {
    const { data, error } = await supabase
      .from('beds')
      .update(bed)
      .eq('id', bed.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
