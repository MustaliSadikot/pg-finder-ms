import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bookingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { useNavigate } from "react-router-dom";
import { PGListing, Room, Bed } from "@/types";
import { format } from "date-fns";

// Import the extracted components
import BookingPrice from "./BookingPrice";
import RoomSelector from "./RoomSelector";
import BedsRequiredSelector from "./BedsRequiredSelector";
import BedSelector from "./BedSelector";
import BookingDatePicker from "./BookingDatePicker";
import OwnerMessage from "./OwnerMessage";

interface BookingFormProps {
  listing: PGListing;
}

const BookingForm: React.FC<BookingFormProps> = ({ listing }) => {
  const { user, isAuthenticated, isOwner } = useAuth();
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
          
          setSelectedBeds([]);
          setBedsRequired(1);
        } catch (error) {
          console.error("Error fetching beds:", error);
        } finally {
          setIsLoadingBeds(false);
        }
      } else {
        setBeds([]);
        setAvailableBedCount(0);
      }
    };

    fetchBeds();
  }, [selectedRoom]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedBeds([]);
  };

  const toggleBedSelection = (bedId: string) => {
    if (selectedBeds.includes(bedId)) {
      setSelectedBeds(selectedBeds.filter(id => id !== bedId));
    } else {
      if (selectedBeds.length < bedsRequired) {
        if (bedsRequired === 1) {
          setSelectedBeds([bedId]);
        } else {
          setSelectedBeds([...selectedBeds, bedId]);
        }
      }
    }
  };

  const handleBedsRequiredChange = (value: string) => {
    const num = parseInt(value, 10);
    setBedsRequired(num);
    
    setSelectedBeds([]);
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

  if (isOwner() && user?.id === listing.ownerId) {
    return <OwnerMessage />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this PG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <BookingPrice listing={listing} />
          
          <div className="border-t pt-4">
            <div className="space-y-4">
              <RoomSelector 
                rooms={rooms} 
                selectedRoom={selectedRoom} 
                onRoomChange={handleRoomChange} 
                isLoadingRooms={isLoadingRooms} 
              />

              {selectedRoom && (
                <>
                  <BedsRequiredSelector 
                    bedsRequired={bedsRequired}
                    onChange={handleBedsRequiredChange}
                    isLoading={isLoadingBeds}
                    availableBedCount={availableBedCount}
                  />

                  {bedsRequired > 0 && availableBedCount > 0 && (
                    <BedSelector 
                      beds={beds}
                      selectedBeds={selectedBeds}
                      bedsRequired={bedsRequired}
                      onToggleBed={toggleBedSelection}
                    />
                  )}
                </>
              )}

              <BookingDatePicker date={date} onDateChange={setDate} />
            </div>
          </div>
          
          {!listing.availability && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded">
              This PG is currently unavailable for booking.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBooking} 
          disabled={
            isBooking || 
            !listing.availability || 
            !selectedRoom || 
            !date || 
            (bedsRequired > 0 && selectedBeds.length !== bedsRequired)
          }
        >
          {isBooking ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
