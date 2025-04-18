
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
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {bedsRequired === 1 ? (
          "We'll find you a cozy bed to stay in! 🛏️"
        ) : (
          `We'll reserve ${bedsRequired} comfortable beds just for you! 🛏️`
        )}
      </p>
      {selectedBeds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected bed{selectedBeds.length > 1 ? 's' : ''}: {selectedBeds.map(id => {
            const bed = beds.find(b => b.id === id);
            return bed ? bed.bedNumber : '';
          }).join(', ')} ✨
        </p>
      )}
    </div>
  );
};

export default BedSelector;
