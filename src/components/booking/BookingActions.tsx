
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Bed, Booking } from "@/types";

interface BookingActionsProps {
  status: Booking["status"];
  bookingId: string;
  bedDetails?: Bed;
  updatingId: string | null;
  onUpdateStatus: (bookingId: string, status: Booking["status"]) => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({
  status,
  bookingId,
  bedDetails,
  updatingId,
  onUpdateStatus,
}) => {
  if (status !== "pending") {
    return null;
  }

  const isDisabled = updatingId === bookingId;
  const isOccupied = bedDetails?.isOccupied;
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
        onClick={() => onUpdateStatus(bookingId, "confirmed")}
        disabled={isDisabled || isOccupied}
        title={isOccupied ? "This bed is already occupied" : "Confirm booking"}
      >
        <Check className="h-4 w-4 mr-1" />
        Confirm
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => onUpdateStatus(bookingId, "rejected")}
        disabled={isDisabled}
      >
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};

export default BookingActions;
