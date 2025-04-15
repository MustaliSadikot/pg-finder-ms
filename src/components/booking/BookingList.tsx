
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsAPI, pgListingsAPI } from "@/services/api";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { Booking, PGListing, Room, Bed } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import BookingCard from "./BookingCard";
import BookingEmptyState from "./BookingEmptyState";
import BookingLoadingState from "./BookingLoadingState";

interface BookingListProps {
  forOwner?: boolean;
  pendingOnly?: boolean;
}

interface BookingWithDetails extends Booking {
  pgDetails?: PGListing;
  roomDetails?: Room;
  bedDetails?: Bed;
}

const BookingList: React.FC<BookingListProps> = ({ forOwner = false, pendingOnly = false }) => {
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

      // Filter for pending bookings if needed
      if (pendingOnly) {
        bookingsList = bookingsList.filter(booking => booking.status === 'pending');
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
  }, [user, pendingOnly, forOwner]);

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

  if (loading) {
    return <BookingLoadingState />;
  }

  if (bookings.length === 0) {
    return <BookingEmptyState pendingOnly={pendingOnly} forOwner={forOwner} />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          forOwner={forOwner}
          updatingId={updatingId}
          onUpdateStatus={handleUpdateStatus}
        />
      ))}
    </div>
  );
};

export default BookingList;
