
import { User, PGListing, Booking, UserRole, FilterOptions } from '../types';
import { mockUsers, mockPGListings, mockBookings } from '../utils/mockData';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const USER_KEY = 'pg_finder_user';
const LISTINGS_KEY = 'pg_finder_listings';
const BOOKINGS_KEY = 'pg_finder_bookings';

// Initialize local storage with mock data
const initializeStorage = () => {
  if (!localStorage.getItem(LISTINGS_KEY)) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(mockPGListings));
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mockBookings));
  }
};

initializeStorage();

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    
    // In a real app, we would make an API call to validate credentials
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Store in local storage
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return user;
  },
  
  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    await delay(500);
    
    // In a real app, we would make an API call to create the user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
    };
    
    // Store in local storage
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

// PG Listings APIs
export const pgListingsAPI = {
  getListings: async (): Promise<PGListing[]> => {
    await delay(300);
    const listingsStr = localStorage.getItem(LISTINGS_KEY);
    return listingsStr ? JSON.parse(listingsStr) : [];
  },
  
  addListing: async (listing: Omit<PGListing, 'id'>): Promise<PGListing> => {
    await delay(500);
    
    const listings = await pgListingsAPI.getListings();
    const newListing: PGListing = {
      ...listing,
      id: `pg_${Date.now()}`,
    };
    
    const updatedListings = [...listings, newListing];
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings));
    
    return newListing;
  },
  
  updateListing: async (listing: PGListing): Promise<PGListing> => {
    await delay(500);
    
    const listings = await pgListingsAPI.getListings();
    const updatedListings = listings.map(l => 
      l.id === listing.id ? listing : l
    );
    
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings));
    
    return listing;
  },
  
  getListingById: async (id: string): Promise<PGListing | null> => {
    await delay(300);
    
    const listings = await pgListingsAPI.getListings();
    return listings.find(l => l.id === id) || null;
  },
  
  getOwnerListings: async (ownerId: string): Promise<PGListing[]> => {
    await delay(300);
    
    const listings = await pgListingsAPI.getListings();
    return listings.filter(l => l.ownerId === ownerId);
  },
  
  filterListings: async (filters: FilterOptions): Promise<PGListing[]> => {
    await delay(300);
    
    const listings = await pgListingsAPI.getListings();
    
    return listings.filter(listing => {
      const priceMatch = 
        listing.price >= filters.priceRange.min && 
        listing.price <= filters.priceRange.max;
      
      const locationMatch = 
        !filters.location || 
        listing.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const genderMatch = 
        !filters.genderPreference || 
        listing.genderPreference === filters.genderPreference || 
        listing.genderPreference === 'any';
      
      const amenitiesMatch = 
        filters.amenities.length === 0 || 
        filters.amenities.every(a => listing.amenities.includes(a));
      
      return priceMatch && locationMatch && genderMatch && amenitiesMatch;
    });
  }
};

// Bookings APIs
export const bookingsAPI = {
  getBookings: async (): Promise<Booking[]> => {
    await delay(300);
    const bookingsStr = localStorage.getItem(BOOKINGS_KEY);
    return bookingsStr ? JSON.parse(bookingsStr) : [];
  },
  
  addBooking: async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    await delay(500);
    
    const bookings = await bookingsAPI.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}`,
    };
    
    const updatedBookings = [...bookings, newBooking];
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
    
    return newBooking;
  },
  
  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<Booking> => {
    await delay(500);
    
    const bookings = await bookingsAPI.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }
    
    const updatedBooking = {
      ...bookings[bookingIndex],
      status,
    };
    
    bookings[bookingIndex] = updatedBooking;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    return updatedBooking;
  },
  
  getTenantBookings: async (tenantId: string): Promise<Booking[]> => {
    await delay(300);
    
    const bookings = await bookingsAPI.getBookings();
    return bookings.filter(b => b.tenantId === tenantId);
  },
  
  getPGBookings: async (pgId: string): Promise<Booking[]> => {
    await delay(300);
    
    const bookings = await bookingsAPI.getBookings();
    return bookings.filter(b => b.pgId === pgId);
  }
};
