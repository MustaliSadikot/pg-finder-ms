
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bookingsAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { PGListing } from "@/types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  listing: PGListing;
}

const BookingForm: React.FC<BookingFormProps> = ({ listing }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isBooking, setIsBooking] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this PG",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!date) {
      toast({
        title: "Date required",
        description: "Please select a booking date",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      await bookingsAPI.addBooking({
        tenantId: user.id,
        pgId: listing.id,
        bookingDate: format(date, "yyyy-MM-dd"),
        status: "pending",
      });

      toast({
        title: "Booking request sent",
        description: "Your booking request has been sent to the owner",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book this PG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Price:</span>
            <span className="font-bold text-pgfinder-primary text-xl">₹{listing.price}/month</span>
          </div>
          
          <div className="border-t border-b py-4">
            <div className="flex flex-col space-y-2">
              <span className="font-medium">Select move-in date:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {!listing.availability && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded">
              This PG is currently unavailable for booking.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBooking} 
          disabled={isBooking || !listing.availability}
        >
          {isBooking ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
