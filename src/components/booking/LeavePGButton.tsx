
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { bookingsAPI } from "@/services/api";

interface LeavePGButtonProps {
  bookingId: string;
  onSuccess?: () => void;
}

const LeavePGButton: React.FC<LeavePGButtonProps> = ({ bookingId, onSuccess }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleLeavePG = async () => {
    setIsProcessing(true);
    try {
      await bookingsAPI.updateBookingStatus(bookingId, "completed");
      toast({
        title: "Success",
        description: "You have successfully left the PG.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error leaving PG:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          Leave PG
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to leave the PG?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark your booking as completed and make your bed available for other tenants.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeavePG}
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600"
          >
            {isProcessing ? "Processing..." : "Yes, leave PG"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeavePGButton;
