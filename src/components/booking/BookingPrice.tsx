
import React from "react";
import { BookingWithDetails } from "@/types";

interface BookingPriceProps {
  booking: BookingWithDetails;
}

const BookingPrice: React.FC<BookingPriceProps> = ({ booking }) => {
  if (!booking.pgDetails?.price) {
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
