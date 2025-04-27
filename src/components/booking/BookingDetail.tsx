
import React from "react";
import { MapPin, Calendar, Home, Bed as BedIcon } from "lucide-react";
import { Room, Bed, PGListing, Booking } from "@/types";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingStatusMessage from "./BookingStatusMessage";

interface BookingDetailProps {
  booking: Booking & {
    pgDetails?: PGListing;
    roomDetails?: Room;
    bedDetails?: Bed;
  };
  forOwner?: boolean;
}

const BookingDetail: React.FC<BookingDetailProps> = ({
  booking,
  forOwner = false,
}) => {
  return (
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
      
      <BookingStatusBadge status={booking.status} />

      {!forOwner && <BookingStatusMessage status={booking.status} />}
    </div>
  );
};

export default BookingDetail;
