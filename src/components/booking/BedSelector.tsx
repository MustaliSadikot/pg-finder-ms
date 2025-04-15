
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Bed } from "@/types";

interface BedSelectorProps {
  beds: Bed[];
  selectedBeds: string[];
  bedsRequired: number;
  onToggleBed: (bedId: string) => void;
}

const BedSelector: React.FC<BedSelectorProps> = ({ 
  beds, 
  selectedBeds, 
  bedsRequired,
  onToggleBed
}) => {
  // Function to handle bed selection
  const handleBedToggle = (bedId: string) => {
    onToggleBed(bedId);
  };

  return (
    <div>
      <Label>Select {bedsRequired} specific {bedsRequired === 1 ? 'bed' : 'beds'}</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {beds.map((bed) => (
          <div 
            key={bed.id} 
            className={`
              flex items-center gap-2 p-2 border rounded cursor-pointer
              ${selectedBeds.includes(bed.id) 
                ? 'border-primary bg-primary/10' 
                : 'border-input hover:border-primary/50'}
              ${selectedBeds.length >= bedsRequired && !selectedBeds.includes(bed.id)
                ? 'opacity-50'
                : ''}
            `}
            onClick={() => handleBedToggle(bed.id)}
          >
            <Checkbox 
              checked={selectedBeds.includes(bed.id)}
              onCheckedChange={() => {}}
              className="pointer-events-none"
            />
            <div>
              <p className="text-sm font-medium">Bed #{bed.bedNumber}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Selected: {selectedBeds.length} of {bedsRequired} beds
      </p>
      {selectedBeds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Bed numbers selected: {selectedBeds.map(id => {
            const bed = beds.find(b => b.id === id);
            return bed ? bed.bedNumber : '';
          }).join(', ')}
        </p>
      )}
    </div>
  );
};

export default BedSelector;
