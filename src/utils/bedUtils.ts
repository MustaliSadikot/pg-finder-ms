
import { Bed } from "@/types";

export const selectAvailableBeds = (
  beds: Bed[],
  bedsRequired: number
): { selectedBeds: string[], bedNumbers: number[] } => {
  const availableBeds = beds.filter(bed => !bed.isOccupied);
  console.log("Available beds for selection:", availableBeds.map(b => ({ id: b.id, number: b.bedNumber })));

  // Create a shuffled copy of the beds array for random selection
  const shuffledBeds = [...availableBeds].sort(() => 0.5 - Math.random());
  
  // Take only the number of beds required
  const selectedBedCount = Math.min(bedsRequired, shuffledBeds.length);
  const selectedBeds = shuffledBeds.slice(0, selectedBedCount);
  
  console.log("Selected bed details:", 
    selectedBeds.map(b => ({
      id: b.id,
      number: b.bedNumber,
      isOccupied: b.isOccupied
    }))
  );

  return {
    selectedBeds: selectedBeds.map(bed => bed.id),
    bedNumbers: selectedBeds.map(bed => bed.bedNumber)
  };
};
