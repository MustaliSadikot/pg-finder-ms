
import React from "react";
import { PGListing } from "@/types";

interface BookingPriceProps {
  listing: PGListing;
}

const BookingPrice: React.FC<BookingPriceProps> = ({ listing }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium">Price:</span>
      <span className="font-bold text-pgfinder-primary text-xl">₹{listing.price}/month</span>
    </div>
  );
};

export default BookingPrice;
