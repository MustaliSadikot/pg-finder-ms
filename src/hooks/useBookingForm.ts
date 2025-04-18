import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Bed, Room, PGListing, User } from "@/types";
import { bookingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { selectAvailableBeds } from "@/utils/bedUtils";

interface UseBookingFormProps {
  listing: PGListing;
  user: User | null;
  isAuthenticated: boolean;
}

export const useBookingForm = ({ listing, user, isAuthenticated }: UseBookingFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [bedsRequired, setBedsRequired] = useState<number>(1);
  const [availableBedCount, setAvailableBedCount] = useState<number>(0);

  useEffect(() => {
    const fetchRooms = async () => {
      if (listing) {
        setIsLoadingRooms(true);
        try {
          const roomsData = await roomAPI.getRoomsByPGId(listing.id);
          setRooms(roomsData.filter(room => room.availability));
        } catch (error) {
          console.error("Error fetching rooms:", error);
        } finally {
          setIsLoadingRooms(false);
        }
      }
    };

    fetchRooms();
  }, [listing]);

  useEffect(() => {
    const fetchBeds = async () => {
      if (selectedRoom) {
        setIsLoadingBeds(true);
        try {
          const bedsData = await bedAPI.getBedsByRoomId(selectedRoom);
          const availableBeds = bedsData.filter(bed => !bed.isOccupied);
          setBeds(availableBeds);
          setAvailableBedCount(availableBeds.length);
          
          if (availableBeds.length > 0 && bedsRequired > 0) {
            const { selectedBeds: newSelectedBeds, bedNumbers } = selectAvailableBeds(
              availableBeds,
              bedsRequired
            );
            
            console.log("Room selection updated:", {
              roomId: selectedRoom,
              availableBedCount: availableBeds.length,
              bedsRequired,
              selectedBedNumbers: bedNumbers
            });
            
            setSelectedBeds(newSelectedBeds);
          } else {
            setSelectedBeds([]);
          }
        } catch (error) {
          console.error("Error fetching beds:", error);
        } finally {
          setIsLoadingBeds(false);
        }
      } else {
        setBeds([]);
        setAvailableBedCount(0);
        setSelectedBeds([]);
      }
    };

    fetchBeds();
  }, [selectedRoom, bedsRequired]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
  };

  const handleBedsRequiredChange = (value: string) => {
    const num = parseInt(value, 10);
    setBedsRequired(num);
  };

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this PG",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!date) {
      toast({
        title: "Date required",
        description: "Please select a booking date",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRoom) {
      toast({
        title: "Room selection required",
        description: "Please select a room",
        variant: "destructive",
      });
      return;
    }

    if (bedsRequired > 0 && selectedBeds.length !== bedsRequired) {
      toast({
        title: "Bed selection required",
        description: `Please select ${bedsRequired} bed${bedsRequired > 1 ? 's' : ''}`,
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      if (bedsRequired > 0 && selectedBeds.length > 0) {
        for (const bedId of selectedBeds) {
          await bookingsAPI.addBooking({
            tenantId: user.id,
            pgId: listing.id,
            roomId: selectedRoom,
            bedId: bedId,
            bookingDate: format(date, "yyyy-MM-dd"),
            status: "pending",
          });
        }
      } else {
        await bookingsAPI.addBooking({
          tenantId: user.id,
          pgId: listing.id,
          roomId: selectedRoom,
          bookingDate: format(date, "yyyy-MM-dd"),
          status: "pending",
        });
      }

      toast({
        title: "Booking request sent",
        description: "Your booking request has been sent to the owner",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return {
    isBooking,
    date,
    setDate,
    rooms,
    selectedRoom,
    handleRoomChange,
    beds,
    selectedBeds,
    isLoadingRooms,
    isLoadingBeds,
    bedsRequired,
    handleBedsRequiredChange,
    handleBooking,
    availableBedCount,
  };
};
