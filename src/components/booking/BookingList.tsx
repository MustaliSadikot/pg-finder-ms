
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsAPI, pgListingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { Booking, PGListing, Room, Bed } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Home, MapPin, Calendar, Bed as BedIcon } from "lucide-react";

interface BookingListProps {
  forOwner?: boolean;
}

interface BookingWithDetails extends Booking {
  pgDetails?: PGListing;
  roomDetails?: Room;
  bedDetails?: Bed;
}

const BookingList: React.FC<BookingListProps> = ({ forOwner = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let bookingsList: Booking[] = [];

      if (forOwner) {
        // Get owner's PG listings
        const listings = await pgListingsAPI.getOwnerListings(user.id);
        // Get bookings for each listing
        const bookingsPromises = listings.map(listing => bookingsAPI.getPGBookings(listing.id));
        const bookingsArrays = await Promise.all(bookingsPromises);
        // Flatten the arrays
        bookingsList = bookingsArrays.flat();
      } else {
        // Get tenant's bookings
        bookingsList = await bookingsAPI.getTenantBookings(user.id);
      }

      // Get PG details, room details, and bed details for each booking
      const bookingsWithDetails: BookingWithDetails[] = await Promise.all(
        bookingsList.map(async (booking) => {
          const pgDetails = await pgListingsAPI.getListingById(booking.pgId);
          
          let roomDetails;
          if (booking.roomId) {
            roomDetails = await roomAPI.getRoomById(booking.roomId);
          }
          
          let bedDetails;
          if (booking.bedId) {
            bedDetails = await bedAPI.getBedById(booking.bedId);
          }
          
          return {
            ...booking,
            pgDetails,
            roomDetails,
            bedDetails,
          };
        })
      );

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Failed to load bookings",
        description: "There was an error loading your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, status: Booking["status"]) => {
    setUpdatingId(bookingId);
    try {
      await bookingsAPI.updateBookingStatus(bookingId, status);
      
      const statusMessage = status === 'confirmed' ? 'confirmed' : 'rejected';
      toast({
        title: `Booking ${statusMessage}`,
        description: `The booking has been ${statusMessage}${status === 'confirmed' ? ' and bed marked as occupied' : ''}`,
      });
      
      // Refresh bookings
      loadBookings();
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {booking.pgDetails?.name || "Unknown PG"}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {booking.pgDetails?.location || "Unknown location"}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Booking Date: <span className="font-medium">{booking.bookingDate}</span></span>
                </div>
                
                {booking.roomDetails && (
                  <div className="flex items-center text-sm">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    <span>Room: <span className="font-medium">{booking.roomDetails.roomNumber}</span></span>
                  </div>
                )}
                
                {booking.bedDetails && (
                  <div className="flex items-center text-sm">
                    <BedIcon className="h-3.5 w-3.5 mr-1" />
                    <span>Bed: <span className="font-medium">#{booking.bedDetails.bedNumber}</span></span>
                    <span className="ml-2 text-xs">
                      ({booking.bedDetails.isOccupied ? 
                        <span className="text-red-500">Occupied</span> : 
                        <span className="text-green-500">Vacant</span>})
                    </span>
                  </div>
                )}
                
                <Badge className={getStatusBadgeColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              
              {forOwner && booking.status === "pending" && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                    onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                    disabled={updatingId === booking.id || (booking.bedDetails?.isOccupied)}
                    title={booking.bedDetails?.isOccupied ? "This bed is already occupied" : "Confirm booking"}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleUpdateStatus(booking.id, "rejected")}
                    disabled={updatingId === booking.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingList;
