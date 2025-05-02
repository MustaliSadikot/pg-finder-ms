
import { Room, Bed } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert Supabase Room to our Room type
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

// Helper function to convert Supabase Bed to our Bed type
const mapSupabaseBedToModel = (bed: any): Bed => {
  return {
    id: bed.id,
    room_id: bed.room_id,
    bed_number: bed.bed_number,
    is_occupied: bed.is_occupied,
    tenant_id: bed.tenant_id,
    created_at: bed.created_at,
    updated_at: bed.updated_at,
    // Map for frontend compatibility
    roomId: bed.room_id,
    bedNumber: bed.bed_number,
    isOccupied: bed.is_occupied,
    tenantId: bed.tenant_id,
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

// Helper function to convert our Bed type to Supabase format
const mapModelToSupabaseBed = (bed: Omit<Bed, 'id'>): any => {
  return {
    room_id: bed.room_id || bed.roomId,
    bed_number: bed.bed_number || bed.bedNumber || 1,
    is_occupied: bed.is_occupied !== undefined ? bed.is_occupied : bed.isOccupied,
    tenant_id: bed.tenant_id || bed.tenantId,
  };
};

export const roomAPI = {
  getRoomsByPGId: async (pgId: string): Promise<Room[]> => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('pg_id', pgId);
    
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

  addRoom: async (room: Omit<Room, 'id'>): Promise<Room> => {
    const supabaseRoom = mapModelToSupabaseRoom(room);
    const { data, error } = await supabase
      .from('rooms')
      .insert(supabaseRoom)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseRoomToModel(data);
  },

  updateRoom: async (room: Room): Promise<Room> => {
    const supabaseRoom = mapModelToSupabaseRoom(room);
    const { data, error } = await supabase
      .from('rooms')
      .update(supabaseRoom)
      .eq('id', room.id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseRoomToModel(data);
  },

  deleteRoom: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
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
  
  addBed: async (bed: Omit<Bed, 'id'>): Promise<Bed> => {
    const supabaseBed = mapModelToSupabaseBed(bed);
    const { data, error } = await supabase
      .from('beds')
      .insert(supabaseBed)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseBedToModel(data);
  },
  
  updateBed: async (bed: Bed): Promise<Bed> => {
    const supabaseBed = {
      is_occupied: bed.is_occupied !== undefined ? bed.is_occupied : bed.isOccupied,
      tenant_id: bed.tenant_id || bed.tenantId
    };

    const { data, error } = await supabase
      .from('beds')
      .update(supabaseBed)
      .eq('id', bed.id)
      .select()
      .single();
    
    if (error) throw error;
    return mapSupabaseBedToModel(data);
  },
  
  deleteBed: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('beds')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
};
