
import React from "react";
import { Booking, PGListing, Room, Bed } from "@/types";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingActions from "./BookingActions";
import BookingPrice from "./BookingPrice";
import BookingDetail from "./BookingDetail";
import LeavePGButton from "./LeavePGButton";

interface BookingCardProps {
  booking: Booking & {
    pgDetails?: PGListing;
    roomDetails?: Room;
    bedDetails?: Bed;
  };
  forOwner?: boolean;
  updatingId: string | null;
  onUpdateStatus: (id: string, status: Booking["status"]) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  forOwner,
  updatingId,
  onUpdateStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{booking.pgDetails?.name}</h3>
          <p className="text-muted-foreground text-sm">
            <BookingDetail booking={booking} forOwner={forOwner} />
          </p>
          <BookingPrice booking={booking} />
        </div>
        <div className="flex items-center space-x-2">
          <BookingStatusBadge status={booking.status} />
          {booking.status === "confirmed" && !forOwner && (
            <LeavePGButton 
              bookingId={booking.id} 
              onSuccess={() => onUpdateStatus(booking.id, "completed" as Booking["status"])}
            />
          )}
          {forOwner && booking.status === "pending" && (
            <BookingActions
              status={booking.status}
              bookingId={booking.id}
              updatingId={updatingId}
              onUpdateStatus={onUpdateStatus}
              bedDetails={booking.bedDetails}
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold">Booking Date</h4>
          <p className="text-muted-foreground text-xs">{booking.bookingDate}</p>
        </div>
        {booking.roomDetails && (
          <div>
            <h4 className="text-sm font-semibold">Room Details</h4>
            <p className="text-muted-foreground text-xs">
              Room Number: {booking.roomDetails.roomNumber}
            </p>
          </div>
        )}
        {booking.bedDetails && (
          <div>
            <h4 className="text-sm font-semibold">Bed Details</h4>
            <p className="text-muted-foreground text-xs">
              Bed Number: {booking.bedDetails.bedNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
