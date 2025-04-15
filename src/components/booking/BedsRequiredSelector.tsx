
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BedsRequiredSelectorProps {
  bedsRequired: number;
  onChange: (value: string) => void;
  isLoading: boolean;
  availableBedCount: number;
}

const BedsRequiredSelector: React.FC<BedsRequiredSelectorProps> = ({ 
  bedsRequired, 
  onChange, 
  isLoading, 
  availableBedCount 
}) => {
  return (
    <div>
      <Label htmlFor="bedsRequired">How many beds do you need?</Label>
      <Select
        value={bedsRequired.toString()}
        onValueChange={onChange}
        disabled={isLoading || availableBedCount === 0}
      >
        <SelectTrigger id="bedsRequired" className="w-full mt-1">
          <SelectValue placeholder="Select number of beds" />
        </SelectTrigger>
        <SelectContent>
          {/* Only show options up to the number of available beds */}
          {Array.from({ length: availableBedCount }, (_, i) => i + 1).map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num} {num === 1 ? 'bed' : 'beds'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <p className="text-sm text-muted-foreground mt-1">Loading beds...</p>}
      {!isLoading && availableBedCount === 0 && (
        <p className="text-sm text-red-500 mt-1">No beds available in this room</p>
      )}
    </div>
  );
};

export default BedsRequiredSelector;
