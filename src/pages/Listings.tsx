
import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import PGCard from "@/components/listings/PGCard";
import FilterSidebar from "@/components/listings/FilterSidebar";
import { pgListingsAPI } from "@/services/api";
import { PGListing, FilterOptions } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Listings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 20000 },
    location: "",
    genderPreference: "",
    amenities: [],
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => pgListingsAPI.filterListings(filters),
  });

  const filteredListings = listings?.filter((listing) =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Available PG Accommodations</h1>
          
          <div className="flex w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by name or location"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="ml-2 md:hidden">
                  <Filter size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-4 h-full overflow-y-auto">
                  <FilterSidebar onFilter={handleFilterChange} maxPrice={20000} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar onFilter={handleFilterChange} maxPrice={20000} />
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading listings...</p>
              </div>
            ) : filteredListings && filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <PGCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-xl text-gray-500 mb-2">No PGs found</p>
                <p className="text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Listings;
