import { User, PGListing, Booking, UserRole, FilterOptions, Room, Bed } from '../types';
import { mockUsers, mockPGListings, mockBookings } from '../utils/mockData';
import { deleteImage } from './storage';
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

// Helper function to convert Supabase PG listing to our PGListing type
const mapSupabasePGToModel = (listing: any): PGListing => {
  return {
    id: listing.id,
    owner_id: listing.owner_id,
    name: listing.name,
    address: listing.address,
    price: listing.price,
    description: listing.description,
    // Map for frontend compatibility
    ownerId: listing.owner_id,
    location: listing.address,
    genderPreference: 'any', // Default value
    amenities: [],
    imageUrl: '/placeholder.svg',
    availability: true,
  };
};

// Helper function to convert our PGListing type to Supabase format
const mapModelToSupabasePG = (listing: Omit<PGListing, 'id'>): any => {
  return {
    owner_id: listing.owner_id || listing.ownerId,
    name: listing.name,
    address: listing.location || listing.address || '',
    price: listing.price,
    description: listing.description || '',
  };
};

// Helper function to convert Supabase Booking to our Booking type
const mapSupabaseBookingToModel = (booking: any): Booking => {
  return {
    id: booking.id,
    tenant_id: booking.tenant_id,
    pg_id: booking.pg_id,
    room_id: booking.room_id,
    bed_id: booking.bed_id,
    status: booking.status || 'pending',
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    // Map for frontend compatibility
    tenantId: booking.tenant_id,
    pgId: booking.pg_id,
    roomId: booking.room_id,
    bedId: booking.bed_id,
    bookingDate: booking.created_at ? new Date(booking.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

// Helper function to convert our Booking type to Supabase format
const mapModelToSupabaseBooking = (booking: Omit<Booking, 'id'>): any => {
  return {
    tenant_id: booking.tenant_id || booking.tenantId,
    pg_id: booking.pg_id || booking.pgId,
    room_id: booking.room_id || booking.roomId,
    bed_id: booking.bed_id || booking.bedId,
    status: booking.status
  };
};

// Helper function to convert Supabase Bed to our Bed type
const mapSupabaseBedToModel = (bed: any): Bed => {
  return {
    id: bed.id,
    room_id: bed.room_id,
    bed_number: bed.bed_number,
    is_occupied: bed.is_occupied,
    tenant_id: bed.tenant_id,
    // Map for frontend compatibility
    roomId: bed.room_id,
    bedNumber: bed.bed_number,
    isOccupied: bed.is_occupied,
    tenantId: bed.tenant_id,
  };
};

// Helper function to convert our Bed type to Supabase format
const mapModelToSupabaseBed = (bed: Omit<Bed, 'id'>): any => {
  return {
    room_id: bed.room_id || bed.roomId,
    bed_number: bed.bed_number || bed.bedNumber,
    is_occupied: bed.is_occupied !== undefined ? bed.is_occupied : bed.isOccupied,
    tenant_id: bed.tenant_id || bed.tenantId,
  };
};

// Helper function for Room conversions
const mapSupabaseRoomToModel = (room: any): Room => {
  return {
    id: room.id,
    pg_id: room.pg_id,
    room_number: room.room_number,
    capacity: room.capacity,
    capacity_per_bed: room.capacity_per_bed || 1,
    created_at: room.created_at,
    // Map for frontend compatibility
    pgId: room.pg_id,
    roomNumber: room.room_number,
    totalBeds: room.capacity,
    capacityPerBed: room.capacity_per_bed || 1,
    availability: true, // Default value
  };
};

// Helper function to convert our Room type to Supabase format
const mapModelToSupabaseRoom = (room: Omit<Room, 'id'>): any => {
  return {
    pg_id: room.pg_id || room.pgId,
    room_number: room.room_number || room.roomNumber || '',
    capacity: room.capacity || room.totalBeds || 1,
    capacity_per_bed: room.capacity_per_bed || room.capacityPerBed || 1,
  };
};

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
    try {
      // First try to get from Supabase
      const { data, error } = await supabase
        .from('pg_listings')
        .select('*');
      
      if (error) throw error;
      
      // If we have data from Supabase, use it
      if (data && data.length > 0) {
        return data.map(mapSupabasePGToModel);
      }
      
      // Fallback to mock data if no data in Supabase
      console.log("No PG listings found in Supabase, falling back to mock data");
      return mockPGListings;
    } catch (error) {
      console.error("Error fetching listings from Supabase:", error);
      // Fallback to mock data in case of errors
      return mockPGListings;
    }
  },
  
  addListing: async (listing: Omit<PGListing, 'id'>): Promise<PGListing> => {
    const supabaseListing = mapModelToSupabasePG(listing);
    const { data, error } = await supabase
      .from('pg_listings')
      .insert(supabaseListing)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabasePGToModel(data);
  },
  
  updateListing: async (listing: PGListing): Promise<PGListing> => {
    const supabaseListing = mapModelToSupabasePG(listing);
    const { data, error } = await supabase
      .from('pg_listings')
      .update(supabaseListing)
      .eq('id', listing.id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabasePGToModel(data);
  },

  deleteListing: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('pg_listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
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
    return data ? mapSupabasePGToModel(data) : null;
  },
  
  getOwnerListings: async (ownerId: string): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw error;
    return (data || []).map(mapSupabasePGToModel);
  },

  filterListings: async (filters: FilterOptions): Promise<PGListing[]> => {
    // Get all listings and filter client-side for now
    const listings = await pgListingsAPI.getListings();
    
    return listings.filter(listing => {
      // Filter by price
      if (listing.price < filters.priceRange.min || listing.price > filters.priceRange.max) {
        return false;
      }
      
      // Filter by location
      if (filters.location && !listing.address?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by gender preference if set
      if (filters.genderPreference && filters.genderPreference !== '') {
        // Only filter if the user selected a specific preference and the listing has a preference
        if (listing.genderPreference && listing.genderPreference !== 'any' && listing.genderPreference !== filters.genderPreference) {
          return false;
        }
      }
      
      // Filter by amenities
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(
          amenity => listing.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }
      
      return true;
    });
  }
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
    return (data || []).map(mapSupabaseBookingToModel);
  },
  
  addBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const supabaseBooking = mapModelToSupabaseBooking(booking);
    const { data, error } = await supabase
      .from('bookings')
      .insert(supabaseBooking)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseBookingToModel(data);
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

    return mapSupabaseBookingToModel(bookingData);
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
    return (data || []).map(mapSupabaseBookingToModel);
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
    return (data || []).map(mapSupabaseBookingToModel);
  },
};

export const roomAPI = {
  getRoomsByListingId: async (listingId: string): Promise<Room[]> => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('pg_id', listingId);
    
    if (error) throw error;
    return (data || []).map(mapSupabaseRoomToModel);
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
    return data ? mapSupabaseRoomToModel(data) : null;
  },
  
  updateRoom: async (room: Room): Promise<Room> => {
    const { data, error } = await supabase
      .from('rooms')
      .update(mapModelToSupabaseRoom(room))
      .eq('id', room.id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseRoomToModel(data);
  },
};

export const bedAPI = {
  getBedsByRoomId: async (roomId: string): Promise<Bed[]> => {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .eq('room_id', roomId);
    
    if (error) throw error;
    return (data || []).map(mapSupabaseBedToModel);
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
    return data ? mapSupabaseBedToModel(data) : null;
  },
  
  updateBed: async (bed: Bed): Promise<Bed> => {
    const { data, error } = await supabase
      .from('beds')
      .update({
        is_occupied: bed.is_occupied !== undefined ? bed.is_occupied : bed.isOccupied,
        tenant_id: bed.tenant_id || bed.tenantId
      })
      .eq('id', bed.id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseBedToModel(data);
  },
};
