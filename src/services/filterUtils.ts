
import { PGListing, FilterOptions } from "@/types";

export const filterListings = (
  listings: PGListing[],
  filters: FilterOptions
): PGListing[] => {
  return listings.filter((listing) => {
    // Price filter
    const isPriceInRange =
      listing.price >= filters.priceRange.min &&
      listing.price <= filters.priceRange.max;

    // Location filter
    const isLocationMatch =
      !filters.location ||
      listing.address.toLowerCase().includes(filters.location.toLowerCase());

    // Gender preference filter
    const isGenderMatch =
      !filters.genderPreference ||
      filters.genderPreference === "" ||
      listing.genderPreference === filters.genderPreference ||
      listing.genderPreference === "any";

    // Amenities filter
    const hasAmenities =
      filters.amenities.length === 0 ||
      (listing.amenities &&
        filters.amenities.every((amenity) =>
          listing.amenities?.includes(amenity)
        ));

    return isPriceInRange && isLocationMatch && isGenderMatch && hasAmenities;
  });
};
