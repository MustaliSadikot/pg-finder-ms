
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PGListing, Room, Bed, User } from '@/types';
import { bookingsAPI } from '@/services/api';
import { roomAPI, bedAPI } from '@/services/roomApi';
import { useToast } from '@/components/ui/use-toast';
import { selectAvailableBeds } from '@/utils/bedUtils';

interface UseBookingFormParams {
  listing: PGListing;
  user: User | null;
  isAuthenticated: boolean;
}

export const useBookingForm = ({ listing, user, isAuthenticated }: UseBookingFormParams) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Record<string, Bed[]>>({});
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [bedsRequired, setBedsRequired] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableBedCount, setAvailableBedCount] = useState(0);

  useEffect(() => {
    if (listing?.id) {
      loadRooms();
    }
  }, [listing?.id]);

  const loadRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const roomsData = await roomAPI.getRoomsByPGId(listing.id);
      
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
      
      // Pre-select the first available room if any
      if (availableRooms.length > 0) {
        setSelectedRoom(availableRooms[0].id);
        
        const availableBeds = bedsData[availableRooms[0].id] || [];
        setAvailableBedCount(availableBeds.length);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load available rooms and beds.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRooms(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      const availableBeds = beds[selectedRoom] || [];
      setAvailableBedCount(availableBeds.length);
      
      // Reset selected beds when room changes
      setSelectedBeds([]);
      setBedsRequired(1);
    }
  }, [selectedRoom, beds]);

  useEffect(() => {
    if (selectedRoom && bedsRequired > 0) {
      const availableBeds = beds[selectedRoom] || [];
      
      if (availableBeds.length >= bedsRequired) {
        const { selectedBeds: newSelectedBeds } = selectAvailableBeds(
          availableBeds,
          bedsRequired
        );
        
        setSelectedBeds(newSelectedBeds);
      } else {
        setSelectedBeds([]);
      }
    }
  }, [bedsRequired, selectedRoom, beds]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleBedsRequiredChange = (value: string) => {
    setBedsRequired(parseInt(value, 10));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
  };

  const handleBooking = async () => {
    if (!user || !isAuthenticated || !listing?.id || !date) {
      toast({
        title: "Error",
        description: "Please log in and provide all required information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);
      
      let booking;
      
      if (selectedRoom && selectedBeds.length > 0) {
        // Book specific beds in a specific room
        const bookingData = {
          tenant_id: user.id,
          pg_id: listing.id,
          room_id: selectedRoom,
          bed_id: selectedBeds[0], // For now, just use the first selected bed
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId: listing.id,
          roomId: selectedRoom,
          bedId: selectedBeds[0],
          bookingDate: date.toISOString().split('T')[0],
        };
        
        booking = await bookingsAPI.addBooking(bookingData);
      } else if (selectedRoom) {
        // Book just a room without a specific bed
        const bookingData = {
          tenant_id: user.id,
          pg_id: listing.id,
          room_id: selectedRoom,
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId: listing.id,
          roomId: selectedRoom,
          bookingDate: date.toISOString().split('T')[0],
        };
        
        booking = await bookingsAPI.addBooking(bookingData);
      } else {
        // Just book the PG without a specific room or bed
        const bookingData = {
          tenant_id: user.id,
          pg_id: listing.id,
          status: 'pending' as const,
          // Frontend compatibility fields
          tenantId: user.id,
          pgId: listing.id,
          bookingDate: date.toISOString().split('T')[0],
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
      setIsBooking(false);
    }
  };

  return {
    isLoading,
    isBooking,
    bookingSuccess,
    rooms,
    beds,
    selectedRoom,
    selectedBeds,
    bedsRequired,
    date,
    isLoadingRooms,
    isLoadingBeds,
    availableBedCount,
    handleRoomChange,
    handleBedsRequiredChange,
    handleDateChange: setDate,
    handleBooking,
    setDate
  };
};

export default useBookingForm;
