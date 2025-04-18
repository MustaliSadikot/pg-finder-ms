import { User, PGListing, Booking, UserRole, FilterOptions } from '../types';
import { mockUsers, mockPGListings, mockBookings } from '../utils/mockData';
import { deleteImage } from './storage';
import { bedAPI } from './roomApi';

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
  
  deleteListing: async (id: string): Promise<boolean> => {
    await delay(500);
    
    const listings = await pgListingsAPI.getListings();
    const listingToDelete = listings.find(l => l.id === id);
    
    if (!listingToDelete) {
      return false;
    }
    
    if (listingToDelete.imageUrl) {
      await deleteImage(listingToDelete.imageUrl);
    }
    
    const updatedListings = listings.filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(updatedListings));
    
    return true;
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
    
    const booking = bookings[bookingIndex];
    const updatedBooking = {
      ...booking,
      status,
    };
    
    if (status === 'confirmed' && booking.bedId) {
      console.log('Marking bed as occupied:', booking.bedId);
      const bed = await bedAPI.getBedById(booking.bedId);
      if (bed && !bed.isOccupied) {
        await bedAPI.updateBed({
          ...bed,
          isOccupied: true
        });
      }
    }
    
    if (booking.status === 'confirmed' && status === 'rejected' && booking.bedId) {
      console.log('Marking bed as vacant:', booking.bedId);
      const bed = await bedAPI.getBedById(booking.bedId);
      if (bed) {
        await bedAPI.updateBed({
          ...bed,
          isOccupied: false
        });
      }
    }
    
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
