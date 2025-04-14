
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bookingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { useNavigate } from "react-router-dom";
import { PGListing, Room, Bed } from "@/types";
import { CalendarIcon, HardHat } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingFormProps {
  listing: PGListing;
}

const BookingForm: React.FC<BookingFormProps> = ({ listing }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedBed, setSelectedBed] = useState<string>("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (listing) {
        setIsLoadingRooms(true);
        try {
          const roomsData = await roomAPI.getRoomsByPGId(listing.id);
          // Only show available rooms
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
          // Only show available (not occupied) beds
          setBeds(bedsData.filter(bed => !bed.isOccupied));
        } catch (error) {
          console.error("Error fetching beds:", error);
        } finally {
          setIsLoadingBeds(false);
        }
      } else {
        setBeds([]);
      }
    };

    fetchBeds();
  }, [selectedRoom]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedBed("");
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

    setIsBooking(true);

    try {
      await bookingsAPI.addBooking({
        tenantId: user.id,
        pgId: listing.id,
        roomId: selectedRoom,
        bedId: selectedBed || undefined,
        bookingDate: format(date, "yyyy-MM-dd"),
        status: "pending",
      });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this PG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Price:</span>
            <span className="font-bold text-pgfinder-primary text-xl">₹{listing.price}/month</span>
          </div>
          
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomSelect">Select Room</Label>
                <Select
                  value={selectedRoom}
                  onValueChange={handleRoomChange}
                  disabled={isLoadingRooms || rooms.length === 0}
                >
                  <SelectTrigger id="roomSelect" className="w-full mt-1">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.totalBeds} beds
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isLoadingRooms && <p className="text-sm text-muted-foreground mt-1">Loading rooms...</p>}
                {!isLoadingRooms && rooms.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">No rooms available</p>
                )}
              </div>

              {selectedRoom && (
                <div>
                  <Label htmlFor="bedSelect">Select Bed (Optional)</Label>
                  <Select
                    value={selectedBed}
                    onValueChange={setSelectedBed}
                    disabled={isLoadingBeds || beds.length === 0}
                  >
                    <SelectTrigger id="bedSelect" className="w-full mt-1">
                      <SelectValue placeholder="Select a bed" />
                    </SelectTrigger>
                    <SelectContent>
                      {beds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          Bed #{bed.bedNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingBeds && <p className="text-sm text-muted-foreground mt-1">Loading beds...</p>}
                  {!isLoadingBeds && beds.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">No beds available</p>
                  )}
                </div>
              )}

              <div>
                <Label>Select move-in date:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
          disabled={isBooking || !listing.availability || !selectedRoom || !date}
        >
          {isBooking ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
