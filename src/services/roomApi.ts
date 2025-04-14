
import { Room, Bed } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const ROOMS_KEY = 'pg_finder_rooms';
const BEDS_KEY = 'pg_finder_beds';

// Initialize local storage with empty arrays if not exists
const initializeStorage = () => {
  if (!localStorage.getItem(ROOMS_KEY)) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(BEDS_KEY)) {
    localStorage.setItem(BEDS_KEY, JSON.stringify([]));
  }
};

initializeStorage();

// Room APIs
export const roomAPI = {
  getRooms: async (): Promise<Room[]> => {
    await delay(300);
    const roomsStr = localStorage.getItem(ROOMS_KEY);
    return roomsStr ? JSON.parse(roomsStr) : [];
  },
  
  getRoomsByPGId: async (pgId: string): Promise<Room[]> => {
    await delay(300);
    const rooms = await roomAPI.getRooms();
    return rooms.filter(room => room.pgId === pgId);
  },
  
  addRoom: async (room: Omit<Room, 'id'>): Promise<Room> => {
    await delay(500);
    
    const rooms = await roomAPI.getRooms();
    const newRoom: Room = {
      ...room,
      id: `room_${Date.now()}`,
    };
    
    const updatedRooms = [...rooms, newRoom];
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updatedRooms));
    
    return newRoom;
  },
  
  updateRoom: async (room: Room): Promise<Room> => {
    await delay(500);
    
    const rooms = await roomAPI.getRooms();
    const updatedRooms = rooms.map(r => 
      r.id === room.id ? room : r
    );
    
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updatedRooms));
    
    return room;
  },
  
  deleteRoom: async (id: string): Promise<boolean> => {
    await delay(500);
    
    const rooms = await roomAPI.getRooms();
    const updatedRooms = rooms.filter(r => r.id !== id);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updatedRooms));
    
    // Also delete associated beds
    const beds = await bedAPI.getBeds();
    const updatedBeds = beds.filter(b => b.roomId !== id);
    localStorage.setItem(BEDS_KEY, JSON.stringify(updatedBeds));
    
    return true;
  },
  
  getRoomById: async (id: string): Promise<Room | null> => {
    await delay(300);
    
    const rooms = await roomAPI.getRooms();
    return rooms.find(r => r.id === id) || null;
  },
};

// Bed APIs
export const bedAPI = {
  getBeds: async (): Promise<Bed[]> => {
    await delay(300);
    const bedsStr = localStorage.getItem(BEDS_KEY);
    return bedsStr ? JSON.parse(bedsStr) : [];
  },
  
  getBedsByRoomId: async (roomId: string): Promise<Bed[]> => {
    await delay(300);
    const beds = await bedAPI.getBeds();
    return beds.filter(bed => bed.roomId === roomId);
  },
  
  addBed: async (bed: Omit<Bed, 'id'>): Promise<Bed> => {
    await delay(500);
    
    const beds = await bedAPI.getBeds();
    const newBed: Bed = {
      ...bed,
      id: `bed_${Date.now()}`,
    };
    
    const updatedBeds = [...beds, newBed];
    localStorage.setItem(BEDS_KEY, JSON.stringify(updatedBeds));
    
    return newBed;
  },
  
  updateBed: async (bed: Bed): Promise<Bed> => {
    await delay(500);
    
    const beds = await bedAPI.getBeds();
    const updatedBeds = beds.map(b => 
      b.id === bed.id ? bed : b
    );
    
    localStorage.setItem(BEDS_KEY, JSON.stringify(updatedBeds));
    
    return bed;
  },
  
  deleteBed: async (id: string): Promise<boolean> => {
    await delay(500);
    
    const beds = await bedAPI.getBeds();
    const updatedBeds = beds.filter(b => b.id !== id);
    localStorage.setItem(BEDS_KEY, JSON.stringify(updatedBeds));
    
    return true;
  },
  
  getBedById: async (id: string): Promise<Bed | null> => {
    await delay(300);
    
    const beds = await bedAPI.getBeds();
    return beds.find(b => b.id === id) || null;
  },
};
