
import { FilterOptions, PGListing } from '@/types';

export const filterListings = (listings: PGListing[], filter: FilterOptions) => {
  return listings.filter(listing => {
    // Price filter
    if (
      listing.price < filter.priceRange.min ||
      listing.price > filter.priceRange.max
    ) {
      return false;
    }

    // Location filter
    if (
      filter.location &&
      !listing.address.toLowerCase().includes(filter.location.toLowerCase())
    ) {
      return false;
    }

    // Gender preference filter
    if (
      filter.genderPreference && 
      filter.genderPreference !== '' && 
      listing.genderPreference && 
      listing.genderPreference !== filter.genderPreference &&
      filter.genderPreference !== 'any'
    ) {
      return false;
    }

    // Amenities filter
    if (
      filter.amenities.length > 0 &&
      listing.amenities &&
      !filter.amenities.every(amenity =>
        listing.amenities?.includes(amenity)
      )
    ) {
      return false;
    }

    return true;
  });
};
