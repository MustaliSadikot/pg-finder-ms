
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PGListing, Room, Bed, User, Booking } from '@/types';
import { bookingsAPI } from '@/services/api';
import { roomAPI, bedAPI } from '@/services/roomApi';
import { useToast } from '@/components/ui/use-toast';

interface UseBookingFormParams {
  pgId: string;
  user: User | null;
}

export const useBookingForm = ({ pgId, user }: UseBookingFormParams) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Record<string, Bed[]>>({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [bedsNeeded, setBedsNeeded] = useState(1);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (pgId) {
      loadRooms();
    }
  }, [pgId]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await roomAPI.getRoomsByPGId(pgId);
      
      // Filter out rooms with no available beds
      const availableRooms = roomsData.filter(room => room.availability !== false);
      setRooms(availableRooms);
      
      // Load beds for each room
      const bedsData: Record<string, Bed[]> = {};
      for (const room of availableRooms) {
        const roomBeds = await bedAPI.getBedsByRoomId(room.id);
        // Filter out occupied beds
        const availableBeds = roomBeds.filter(bed => !(bed.is_occupied || bed.isOccupied));
        bedsData[room.id] = availableBeds;
      }
      
      setBeds(bedsData);
      
      // Pre-select the first available room and bed if any
      if (availableRooms.length > 0) {
        setSelectedRoom(availableRooms[0]);
        
        if (bedsData[availableRooms[0].id]?.length > 0) {
          setSelectedBed(bedsData[availableRooms[0].id][0]);
        }
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load available rooms and beds.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId) || null;
    setSelectedRoom(room);
    setSelectedBed(null);
    
    if (room && beds[room.id]?.length > 0) {
      setSelectedBed(beds[room.id][0]);
    }
  };

  const handleBedChange = (bedId: string) => {
    if (!selectedRoom) return;
    
    const bed = beds[selectedRoom.id]?.find(b => b.id === bedId) || null;
    setSelectedBed(bed);
  };

  const handleBedsNeededChange = (value: number) => {
    setBedsNeeded(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    setBookingDate(date);
  };

  const handleSubmitBooking = async () => {
    if (!user || !pgId || !bookingDate) {
      toast({
        title: "Error",
        description: "Please provide all required information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      let booking;
      
      if (selectedRoom && selectedBed) {
        // Book a specific bed in a specific room
        const bookingData = {
          tenant_id: user.id,
          pg_id: pgId,
          room_id: selectedRoom.id,
          bed_id: selectedBed.id,
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId,
          roomId: selectedRoom.id,
          bedId: selectedBed.id,
          bookingDate: bookingDate.toISOString().split('T')[0],
        };
        
        booking = await bookingsAPI.addBooking(bookingData);
      } else if (selectedRoom) {
        // Book just a room without a specific bed
        const bookingData = {
          tenant_id: user.id,
          pg_id: pgId,
          room_id: selectedRoom.id,
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId,
          roomId: selectedRoom.id,
          bookingDate: bookingDate.toISOString().split('T')[0],
        };
        
        booking = await bookingsAPI.addBooking(bookingData);
      } else {
        // Just book the PG without a specific room or bed
        const bookingData = {
          tenant_id: user.id,
          pg_id: pgId,
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId,
          bookingDate: bookingDate.toISOString().split('T')[0],
        };
        
        booking = await bookingsAPI.addBooking(bookingData);
      }
      
      setBookingSuccess(true);
      toast({
        title: "Booking successful",
        description: "Your booking request has been sent to the owner for approval.",
      });
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    bookingSuccess,
    rooms,
    beds,
    selectedRoom,
    selectedBed,
    bedsNeeded,
    bookingDate,
    handleRoomChange,
    handleBedChange,
    handleBedsNeededChange,
    handleDateChange,
    handleSubmitBooking,
  };
};

export default useBookingForm;
