export type UserRole = 'tenant' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface PGListing {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  price: number;
  genderPreference: 'male' | 'female' | 'any';
  amenities: string[];
  imageUrl: string;
  availability: boolean;
  description?: string;
}

export interface Room {
  id: string;
  pgId: string;
  roomNumber: string;
  totalBeds: number;
  capacityPerBed: number;
  availability: boolean;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: number;
  isOccupied: boolean;
}

export interface Booking {
  id: string;
  tenantId: string;
  pgId: string;
  roomId?: string;
  bedId?: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
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
