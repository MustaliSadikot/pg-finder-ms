
import React from "react";
import { Booking } from "@/types";

interface BookingPriceProps {
  booking: Booking & {
    pgDetails?: any;
  };
}

const BookingPrice: React.FC<BookingPriceProps> = ({ booking }) => {
  // Make sure pgDetails exists and has a price before rendering
  if (!booking.pgDetails) {
    return null;
  }
  
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="font-medium">Price:</span>
      <span className="font-bold text-pgfinder-primary text-xl">
        ₹{booking.pgDetails.price}/month
      </span>
    </div>
  );
};

export default BookingPrice;
