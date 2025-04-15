
import React from "react";

interface BookingEmptyStateProps {
  pendingOnly: boolean;
  forOwner: boolean;
}

const BookingEmptyState: React.FC<BookingEmptyStateProps> = ({ pendingOnly, forOwner }) => {
  return (
    <div className="text-center p-8">
      <p className="text-muted-foreground">
        {pendingOnly 
          ? `No pending ${forOwner ? "booking requests" : "bookings"} found.` 
          : `No bookings found.`}
      </p>
    </div>
  );
};

export default BookingEmptyState;
