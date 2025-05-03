import { PGListing, User, UserRole, FilterOptions, Booking, BookingWithDetails } from '@/types';
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

export const pgListingsAPI = {
  getListings: async (): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*');

    if (error) {
      throw error;
    }

    return data.map(listing => ({
      ...listing,
      ownerId: listing.owner_id,
      location: listing.address,
    }));
  },

  getListingById: async (id: string): Promise<PGListing | null> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // If no record is found, return null instead of throwing an error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Map the Supabase data to our PGListing type
    return {
      ...data,
      ownerId: data.owner_id,
      location: data.address,
    };
  },

  addListing: async (listing: Omit<PGListing, 'id'>): Promise<PGListing> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .insert([
        {
          owner_id: listing.owner_id || listing.ownerId,
          name: listing.name,
          address: listing.address || listing.location,
          price: listing.price,
          description: listing.description,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map the Supabase data to our PGListing type
    return {
      ...data,
      ownerId: data.owner_id,
      location: data.address,
    };
  },

  updateListing: async (listing: PGListing): Promise<PGListing> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .update({
        name: listing.name,
        address: listing.address || listing.location,
        price: listing.price,
        description: listing.description,
      })
      .eq('id', listing.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map the Supabase data to our PGListing type
    return {
      ...data,
      ownerId: data.owner_id,
      location: data.address,
    };
  },

  deleteListing: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('pg_listings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  },

  getOwnerListings: async (ownerId: string): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      throw error;
    }

    return data.map(listing => ({
      ...listing,
      ownerId: listing.owner_id,
      location: listing.address,
    }));
  },
};

export const filterListings = (
  listings: PGListing[],
  filters: FilterOptions
): PGListing[] => {
  return listings.filter((listing) => {
    // Price filter
    if (
      listing.price < filters.priceRange.min ||
      listing.price > filters.priceRange.max
    ) {
      return false;
    }

    // Location filter
    if (
      filters.location &&
      !listing.location?.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Gender preference filter - Fixed comparison by checking for empty string explicitly
    if (
      filters.genderPreference && 
      filters.genderPreference !== '' && 
      listing.genderPreference !== filters.genderPreference
    ) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      const listingAmenities = listing.amenities || [];
      if (!filters.amenities.every((a) => listingAmenities.includes(a))) {
        return false;
      }
    }

    return true;
  });
};

export const bookingsAPI = {
  createBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          tenant_id: booking.tenant_id || booking.tenantId,
          pg_id: booking.pg_id || booking.pgId,
          room_id: booking.room_id || booking.roomId,
          bed_id: booking.bed_id || booking.bedId,
          status: booking.status,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      pg_id: data.pg_id,
      room_id: data.room_id,
      bed_id: data.bed_id,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tenantId: data.tenant_id,
      pgId: data.pg_id,
      roomId: data.room_id,
      bedId: data.bed_id,
    };
  },

  updateBookingStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      pg_id: data.pg_id,
      room_id: data.room_id,
      bed_id: data.bed_id,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tenantId: data.tenant_id,
      pgId: data.pg_id,
      roomId: data.room_id,
      bedId: data.bed_id,
    };
  },

  getBookingById: async (id: string): Promise<Booking | null> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? {
      id: data.id,
      tenant_id: data.tenant_id,
      pg_id: data.pg_id,
      room_id: data.room_id,
      bed_id: data.bed_id,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tenantId: data.tenant_id,
      pgId: data.pg_id,
      roomId: data.room_id,
      bedId: data.bed_id,
    } : null;
  },

  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('tenant_id', userId);

    if (error) {
      throw error;
    }

    return data.map(booking => ({
      id: booking.id,
      tenant_id: booking.tenant_id,
      pg_id: booking.pg_id,
      room_id: booking.room_id,
      bed_id: booking.bed_id,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tenantId: booking.tenant_id,
      pgId: booking.pg_id,
      roomId: booking.room_id,
      bedId: booking.bed_id,
    }));
  },

  getPGListingsWithDetails: async (): Promise<BookingWithDetails[]> => {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        pg_listings (
          id,
          owner_id,
          name,
          address,
          price,
          description
        ),
        rooms (
          id,
          pg_id,
          room_number,
          capacity
        ),
        beds (
          id,
          room_id,
          bed_number,
          is_occupied
        )
      `);
  
    if (bookingsError) {
      throw bookingsError;
    }
  
    return bookings.map(booking => ({
      id: booking.id,
      tenant_id: booking.tenant_id,
      pg_id: booking.pg_id,
      room_id: booking.room_id,
      bed_id: booking.bed_id,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tenantId: booking.tenant_id,
      pgId: booking.pg_id,
      roomId: booking.room_id,
      bedId: booking.bed_id,
      pgDetails: booking.pg_listings,
      roomDetails: booking.rooms,
      bedDetails: booking.beds,
    }));
  },

  getPGBookings: async (pgId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('pg_id', pgId);

    if (error) {
      throw error;
    }

    return data.map(booking => ({
      id: booking.id,
      tenant_id: booking.tenant_id,
      pg_id: booking.pg_id,
      room_id: booking.room_id,
      bed_id: booking.bed_id,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tenantId: booking.tenant_id,
      pgId: booking.pg_id,
      roomId: booking.room_id,
      bedId: booking.bed_id,
    }));
  },
};
