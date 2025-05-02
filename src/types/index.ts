
export type UserRole = 'tenant' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Base interface that matches Supabase database schema
export interface PGListing {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  price: number;
  description?: string;
  // Fields used in frontend components but not in DB
  ownerId?: string;
  location?: string;
  genderPreference?: 'male' | 'female' | 'any';
  amenities?: string[];
  imageUrl?: string;
  availability?: boolean;
}

export interface Room {
  id: string;
  pg_id: string;
  room_number: string;
  capacity: number;
  capacity_per_bed?: number;  // Added for frontend compatibility
  created_at?: string;
  // Fields for frontend compatibility
  pgId?: string;
  roomNumber?: string;
  totalBeds?: number;
  capacityPerBed?: number;
  availability?: boolean;
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: number;
  is_occupied: boolean;
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Fields for frontend compatibility
  roomId?: string;
  bedNumber?: number;
  isOccupied?: boolean;
  tenantId?: string | null;
}

export interface Booking {
  id: string;
  tenant_id: string;
  pg_id: string;
  room_id?: string;
  bed_id?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  created_at?: string;
  updated_at?: string;
  // Fields for frontend compatibility
  tenantId?: string;
  pgId?: string;
  roomId?: string;
  bedId?: string;
  bookingDate?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  location: string;
  genderPreference: 'male' | 'female' | 'any' | '';
  amenities: string[];
}

export interface BookingWithDetails extends Booking {
  pgDetails?: PGListing;
  roomDetails?: Room;
  bedDetails?: Bed;
}
