
import React from "react";
import { Bed } from "@/types";

interface BedSelectorProps {
  beds: Bed[];
  selectedBeds: string[];
  bedsRequired: number;
}

const BedSelector: React.FC<BedSelectorProps> = ({ 
  beds, 
  selectedBeds,
  bedsRequired,
}) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {bedsRequired} bed{bedsRequired > 1 ? 's' : ''} will be automatically assigned
      </p>
      {selectedBeds.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Assigned bed numbers: {selectedBeds.map(id => {
            const bed = beds.find(b => b.id === id);
            return bed ? bed.bedNumber : '';
          }).join(', ')}
        </p>
      )}
    </div>
  );
};

export default BedSelector;
