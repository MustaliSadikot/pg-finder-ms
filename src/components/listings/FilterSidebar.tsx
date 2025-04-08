
import React from "react";
import { useForm } from "react-hook-form";
import { FilterOptions } from "@/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSidebarProps {
  onFilter: (filters: FilterOptions) => void;
  maxPrice?: number;
}

const commonAmenities = [
  { id: "wifi", label: "WiFi" },
  { id: "ac", label: "AC" },
  { id: "food", label: "Food" },
  { id: "laundry", label: "Laundry" },
  { id: "gym", label: "Gym" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilter, maxPrice = 15000 }) => {
  const form = useForm<FilterOptions>({
    defaultValues: {
      priceRange: {
        min: 0,
        max: maxPrice,
      },
      location: "",
      genderPreference: "",
      amenities: [],
    },
  });

  const onSubmit = (data: FilterOptions) => {
    onFilter(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Filter PGs</h3>
          
          <div className="space-y-5">
            {/* Price Range Filter */}
            <div className="space-y-3">
              <h4 className="font-medium">Price Range</h4>
              <FormField
                control={form.control}
                name="priceRange.min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Min Price"
                        min={0}
                        max={form.watch("priceRange.max")}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceRange.max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Max Price"
                        min={form.watch("priceRange.min")}
                        max={maxPrice}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Location Filter */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Search by city" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Gender Preference Filter */}
            <FormField
              control={form.control}
              name="genderPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="male">Male Only</SelectItem>
                      <SelectItem value="female">Female Only</SelectItem>
                      <SelectItem value="any">Any (Co-ed)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {/* Amenities Filter */}
            <div className="space-y-2">
              <FormLabel>Amenities</FormLabel>
              <div className="space-y-2">
                {commonAmenities.map((amenity) => (
                  <FormField
                    key={amenity.id}
                    control={form.control}
                    name="amenities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={amenity.id}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(amenity.label)}
                              onCheckedChange={(checked) => {
                                const currentValue = [...(field.value || [])];
                                if (checked) {
                                  field.onChange([...currentValue, amenity.label]);
                                } else {
                                  field.onChange(
                                    currentValue.filter((value) => value !== amenity.label)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {amenity.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-6">
            Apply Filters
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              form.reset({
                priceRange: {
                  min: 0,
                  max: maxPrice,
                },
                location: "",
                genderPreference: "",
                amenities: [],
              });
              onFilter({
                priceRange: {
                  min: 0,
                  max: maxPrice,
                },
                location: "",
                genderPreference: "",
                amenities: [],
              });
            }}
          >
            Reset Filters
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FilterSidebar;
