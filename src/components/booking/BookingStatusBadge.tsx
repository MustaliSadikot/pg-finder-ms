
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { Booking } from "@/types";

interface BookingStatusBadgeProps {
  status: Booking["status"];
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getStatusBadgeColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <Check className="h-3.5 w-3.5 mr-1" />;
      case "rejected":
        return <X className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <Badge className={`flex items-center ${getStatusBadgeColor(status)}`}>
      {getStatusIcon(status)}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default BookingStatusBadge;
