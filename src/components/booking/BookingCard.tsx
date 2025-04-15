
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Booking, PGListing, Room, Bed } from "@/types";
import BookingDetail from "./BookingDetail";
import BookingActions from "./BookingActions";

interface BookingCardProps {
  booking: Booking & {
    pgDetails?: PGListing;
    roomDetails?: Room;
    bedDetails?: Bed;
  };
  forOwner: boolean;
  updatingId: string | null;
  onUpdateStatus: (bookingId: string, status: Booking["status"]) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  forOwner,
  updatingId,
  onUpdateStatus,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <BookingDetail
            booking={booking}
            pgDetails={booking.pgDetails}
            roomDetails={booking.roomDetails}
            bedDetails={booking.bedDetails}
            forOwner={forOwner}
          />
          
          {forOwner && (
            <BookingActions
              status={booking.status}
              bookingId={booking.id}
              bedDetails={booking.bedDetails}
              updatingId={updatingId}
              onUpdateStatus={onUpdateStatus}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
