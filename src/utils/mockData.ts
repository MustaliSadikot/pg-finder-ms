
import { User, PGListing, Booking } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'tenant',
  },
  {
    id: 'user_3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'tenant',
  },
];

export const mockPGListings: PGListing[] = [
  {
    id: 'pg_1',
    owner_id: 'user_1',
    address: 'Koramangala, Bangalore',
    name: 'Sunset PG',
    price: 12000,
    description: 'A comfortable PG accommodation in Koramangala with all modern amenities.',
    // Frontend compatibility fields
    ownerId: 'user_1',
    location: 'Koramangala, Bangalore',
    genderPreference: 'male',
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'TV', 'Parking'],
    imageUrl: '/placeholder.svg',
    availability: true,
  },
  {
    id: 'pg_2',
    owner_id: 'user_1',
    address: 'HSR Layout, Bangalore',
    name: 'Green Villa PG',
    price: 15000,
    description: 'Premium PG accommodation in HSR Layout with high-end facilities.',
    // Frontend compatibility fields
    ownerId: 'user_1',
    location: 'HSR Layout, Bangalore',
    genderPreference: 'female',
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Gym', 'TV', 'Cleaning Service'],
    imageUrl: '/placeholder.svg',
    availability: true,
  },
  {
    id: 'pg_3',
    owner_id: 'user_1',
    address: 'Indiranagar, Bangalore',
    name: 'City Life PG',
    price: 14000,
    description: 'Modern PG in the heart of Indiranagar with excellent connectivity.',
    // Frontend compatibility fields
    ownerId: 'user_1',
    location: 'Indiranagar, Bangalore',
    genderPreference: 'any',
    amenities: ['WiFi', 'AC', 'Food', 'Cleaning Service'],
    imageUrl: '/placeholder.svg',
    availability: true,
  },
  {
    id: 'pg_4',
    owner_id: 'user_1',
    address: 'BTM Layout, Bangalore',
    name: 'Comfort Zone PG',
    price: 10000,
    description: 'Budget-friendly PG accommodation in BTM Layout.',
    // Frontend compatibility fields
    ownerId: 'user_1',
    location: 'BTM Layout, Bangalore',
    genderPreference: 'male',
    amenities: ['WiFi', 'Food', 'Laundry', 'Security'],
    imageUrl: '/placeholder.svg',
    availability: true,
  },
  {
    id: 'pg_5',
    owner_id: 'user_1',
    address: 'Whitefield, Bangalore',
    name: 'Tech Park PG',
    price: 13000,
    description: 'Convenient PG near major IT parks in Whitefield.',
    // Frontend compatibility fields
    ownerId: 'user_1',
    location: 'Whitefield, Bangalore',
    genderPreference: 'female',
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Security'],
    imageUrl: '/placeholder.svg',
    availability: true,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    tenant_id: 'user_2',
    pg_id: 'pg_1',
    status: 'confirmed',
    // Frontend compatibility fields
    tenantId: 'user_2',
    pgId: 'pg_1',
    bookingDate: '2023-10-15',
  },
  {
    id: 'booking_2',
    tenant_id: 'user_3',
    pg_id: 'pg_2',
    status: 'pending',
    // Frontend compatibility fields
    tenantId: 'user_3',
    pgId: 'pg_2',
    bookingDate: '2023-10-20',
  },
];
