
import { Bed } from "@/types";

export const selectAvailableBeds = (
  beds: Bed[],
  bedsRequired: number
): { selectedBeds: string[], bedNumbers: number[] } => {
  // Filter only available beds
  const availableBeds = beds.filter(bed => !(bed.is_occupied || bed.isOccupied));
  console.log("Available beds for selection:", availableBeds.map(b => ({ id: b.id, number: b.bedNumber || b.bed_number })));

  // Create a shuffled copy of the beds array for random selection
  const shuffledBeds = [...availableBeds].sort(() => 0.5 - Math.random());
  
  // Take only the number of beds required
  const selectedBedCount = Math.min(bedsRequired, shuffledBeds.length);
  const selectedBeds = shuffledBeds.slice(0, selectedBedCount);
  
  console.log("Selected bed details:", 
    selectedBeds.map(b => ({
      id: b.id,
      number: b.bedNumber || b.bed_number,
      isOccupied: b.isOccupied || b.is_occupied
    }))
  );

  return {
    selectedBeds: selectedBeds.map(bed => bed.id),
    bedNumbers: selectedBeds.map(bed => bed.bedNumber || bed.bed_number)
  };
};

// Function to get a unique set of bed IDs
export const getUniqueBedIds = (bedIds: string[]): string[] => {
  return [...new Set(bedIds)];
};
