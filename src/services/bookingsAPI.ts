
import { Booking, BookingWithDetails } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
      status: data.status as Booking['status'],
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
      status: data.status as Booking['status'],
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
      status: data.status as Booking['status'],
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
      status: booking.status as Booking['status'],
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tenantId: booking.tenant_id,
      pgId: booking.pg_id,
      roomId: booking.room_id,
      bedId: booking.bed_id,
    }));
  },

  // Alias for getUserBookings to fix existing code references
  getTenantBookings: async (userId: string): Promise<Booking[]> => {
    return bookingsAPI.getUserBookings(userId);
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
      status: booking.status as Booking['status'],
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
      status: booking.status as Booking['status'],
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tenantId: booking.tenant_id,
      pgId: booking.pg_id,
      roomId: booking.room_id,
      bedId: booking.bed_id,
    }));
  },
  
  // Add alias for addBooking to match code references in useBookingForm.ts
  addBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    return bookingsAPI.createBooking(booking);
  }
};
