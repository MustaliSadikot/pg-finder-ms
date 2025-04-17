
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PGListing } from "@/types";
import { useBookingForm } from "@/hooks/useBookingForm";

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
  const {
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
    toggleBedSelection,
    handleBooking,
    availableBedCount,
  } = useBookingForm({ listing, user, isAuthenticated });

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
