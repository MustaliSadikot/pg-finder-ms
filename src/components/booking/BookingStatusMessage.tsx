
import React from "react";
import { Check, X, HelpCircle } from "lucide-react";
import { Booking } from "@/types";

interface BookingStatusMessageProps {
  status: Booking["status"];
}

const BookingStatusMessage: React.FC<BookingStatusMessageProps> = ({ status }) => {
  if (status === "pending") {
    return (
      <div className="text-sm mt-2 p-2 bg-blue-50 rounded border border-blue-100 flex items-start">
        <HelpCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-blue-700">
          Your booking is waiting for approval from the PG owner. You'll be notified when the status changes.
        </p>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="text-sm mt-2 p-2 bg-green-50 rounded border border-green-100 flex items-start">
        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-green-700">
          Congratulations! Your booking has been confirmed. You can contact the PG owner for further details.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="text-sm mt-2 p-2 bg-red-50 rounded border border-red-100 flex items-start">
        <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-red-700">
          Your booking request has been rejected. Please try booking another PG or contact support for assistance.
        </p>
      </div>
    );
  }

  return null;
};

export default BookingStatusMessage;
