
import { PGListing, FilterOptions } from '@/types';

// Helper function for filtering listings
export const filterListings = (
  listings: PGListing[],
  filters: FilterOptions
): PGListing[] => {
  return listings.filter((listing) => {
    // Price filter
    if (
      listing.price < filters.priceRange.min ||
      listing.price > filters.priceRange.max
    ) {
      return false;
    }

    // Location filter
    if (
      filters.location &&
      !listing.location?.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Gender preference filter - Fixed comparison
    if (
      filters.genderPreference && 
      filters.genderPreference !== '' && 
      listing.genderPreference !== filters.genderPreference
    ) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      const listingAmenities = listing.amenities || [];
      if (!filters.amenities.every((a) => listingAmenities.includes(a))) {
        return false;
      }
    }

    return true;
  });
};
