
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bookingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { useNavigate } from "react-router-dom";
import { PGListing, Room, Bed } from "@/types";
import { CalendarIcon, BedDouble } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
          const availableBeds = bedsData.filter(bed => !bed.isOccupied);
          setBeds(availableBeds);
          setAvailableBedCount(availableBeds.length);
          
          // Reset selected beds when room changes
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
      // Only allow selection if we haven't reached the limit
      if (selectedBeds.length < bedsRequired) {
        setSelectedBeds([...selectedBeds, bedId]);
      }
    }
  };

  const handleBedsRequiredChange = (value: string) => {
    const num = parseInt(value, 10);
    setBedsRequired(num);
    
    // Clear selected beds when changing the required count
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

    // For multiple bed selection
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
        // Create individual bookings for each selected bed
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
        // Room-only booking (no specific beds)
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

  // If the current user is the owner of this PG, don't show booking options
  if (isOwner() && user?.id === listing.ownerId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4 text-muted-foreground">
            You cannot book your own PG.
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <>
                  <div>
                    <Label htmlFor="bedsRequired">How many beds do you need?</Label>
                    <Select
                      value={bedsRequired.toString()}
                      onValueChange={handleBedsRequiredChange}
                      disabled={isLoadingBeds || availableBedCount === 0}
                    >
                      <SelectTrigger id="bedsRequired" className="w-full mt-1">
                        <SelectValue placeholder="Select number of beds" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Only show options up to the number of available beds */}
                        {Array.from({ length: availableBedCount }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'bed' : 'beds'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoadingBeds && <p className="text-sm text-muted-foreground mt-1">Loading beds...</p>}
                    {!isLoadingBeds && availableBedCount === 0 && (
                      <p className="text-sm text-red-500 mt-1">No beds available in this room</p>
                    )}
                  </div>

                  {bedsRequired > 0 && availableBedCount > 0 && (
                    <div>
                      <Label>Select {bedsRequired} specific {bedsRequired === 1 ? 'bed' : 'beds'}</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {beds.map((bed) => (
                          <div 
                            key={bed.id} 
                            className={`
                              flex items-center gap-2 p-2 border rounded cursor-pointer
                              ${selectedBeds.includes(bed.id) 
                                ? 'border-primary bg-primary/10' 
                                : 'border-input hover:border-primary/50'}
                              ${selectedBeds.length >= bedsRequired && !selectedBeds.includes(bed.id)
                                ? 'opacity-50'
                                : ''}
                            `}
                            onClick={() => toggleBedSelection(bed.id)}
                          >
                            <Checkbox 
                              checked={selectedBeds.includes(bed.id)}
                              className="pointer-events-none"
                            />
                            <div>
                              <p className="text-sm font-medium">Bed #{bed.bedNumber}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {selectedBeds.length} of {bedsRequired} beds
                      </p>
                      {selectedBeds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Bed numbers selected: {selectedBeds.map(id => {
                            const bed = beds.find(b => b.id === id);
                            return bed ? bed.bedNumber : '';
                          }).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </>
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
