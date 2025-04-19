
import React from "react";
import { Bed } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BedIcon } from "lucide-react";

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
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Selected bed{selectedBeds.length > 1 ? 's' : ''}: 
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedBeds.map(id => {
              const bed = beds.find(b => b.id === id);
              return bed ? (
                <Badge key={id} variant="outline" className="flex items-center gap-1 py-1.5 bg-blue-50 text-blue-700">
                  <BedIcon className="h-3 w-3" />
                  Bed #{bed.bedNumber}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BedSelector;
