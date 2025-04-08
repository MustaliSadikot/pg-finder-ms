
import { User, PGListing, Booking } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Owner',
    email: 'owner@example.com',
    role: 'owner',
  },
  {
    id: '2',
    name: 'Jane Tenant',
    email: 'tenant@example.com',
    role: 'tenant',
  },
];

// Mock PG Listings
export const mockPGListings: PGListing[] = [
  {
    id: '1',
    ownerId: '1',
    name: 'Sunshine PG',
    location: 'Mumbai',
    price: 8500,
    genderPreference: 'male',
    amenities: ['WiFi', 'AC', 'Food', 'Laundry'],
    imageUrl: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    availability: true,
    description: 'A cozy PG with all modern amenities and located near the metro station.',
  },
  {
    id: '2',
    ownerId: '1',
    name: 'City Living PG',
    location: 'Bangalore',
    price: 10000,
    genderPreference: 'female',
    amenities: ['WiFi', 'AC', 'Food', 'Gym'],
    imageUrl: 'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    availability: true,
    description: 'Luxurious PG in the heart of the city with premium facilities.',
  },
  {
    id: '3',
    ownerId: '1',
    name: 'Green Valley PG',
    location: 'Delhi',
    price: 7500,
    genderPreference: 'any',
    amenities: ['WiFi', 'Food', 'Parking'],
    imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    availability: true,
    description: 'Affordable PG with basic amenities in a calm and peaceful environment.',
  },
  {
    id: '4',
    ownerId: '1',
    name: 'Tech Hub PG',
    location: 'Bangalore',
    price: 12000,
    genderPreference: 'male',
    amenities: ['WiFi', 'AC', 'Food', 'Gym', 'Gaming Zone'],
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    availability: true,
    description: 'Premium PG specially designed for tech professionals with high-speed internet and working spaces.',
  },
  {
    id: '5',
    ownerId: '1',
    name: 'Lakeside View PG',
    location: 'Pune',
    price: 9000,
    genderPreference: 'female',
    amenities: ['WiFi', 'AC', 'Food', 'Security'],
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    availability: true,
    description: 'Beautiful PG with lakeside views and all modern amenities.',
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    tenantId: '2',
    pgId: '1',
    bookingDate: '2025-04-10',
    status: 'confirmed',
  },
  {
    id: '2',
    tenantId: '2',
    pgId: '3',
    bookingDate: '2025-04-15',
    status: 'pending',
  },
];
