
import { PGListing, FilterOptions } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { filterListings } from './filterUtils';

export const pgListingsAPI = {
  getListings: async (): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*');

    if (error) {
      throw error;
    }

    return data.map(listing => ({
      ...listing,
      ownerId: listing.owner_id,
      location: listing.address,
    }));
  },

  getListingById: async (id: string): Promise<PGListing | null> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // If no record is found, return null instead of throwing an error
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Map the Supabase data to our PGListing type
    return {
      ...data,
      ownerId: data.owner_id,
      location: data.address,
    };
  },

  addListing: async (listing: Omit<PGListing, 'id'>): Promise<PGListing> => {
    try {
      // Get authenticated user's session to ensure proper authorization
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pg_listings')
        .insert([
          {
            owner_id: listing.owner_id || listing.ownerId,
            name: listing.name,
            address: listing.address || listing.location,
            price: listing.price,
            description: listing.description,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding listing:', error);
        throw error;
      }

      // Map the Supabase data to our PGListing type
      return {
        ...data,
        ownerId: data.owner_id,
        location: data.address,
      };
    } catch (error) {
      console.error('Error adding listing:', error);
      throw error;
    }
  },

  updateListing: async (listing: PGListing): Promise<PGListing> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .update({
        name: listing.name,
        address: listing.address || listing.location,
        price: listing.price,
        description: listing.description,
      })
      .eq('id', listing.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map the Supabase data to our PGListing type
    return {
      ...data,
      ownerId: data.owner_id,
      location: data.address,
    };
  },

  deleteListing: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('pg_listings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  },

  getOwnerListings: async (ownerId: string): Promise<PGListing[]> => {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      throw error;
    }

    return data.map(listing => ({
      ...listing,
      ownerId: listing.owner_id,
      location: listing.address,
    }));
  },

  filterListings: async (filters: FilterOptions): Promise<PGListing[]> => {
    // First fetch all listings
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*');

    if (error) {
      throw error;
    }

    // Convert database format to PGListing format
    const listings = data.map(listing => ({
      ...listing,
      ownerId: listing.owner_id,
      location: listing.address,
    }));

    // Then filter them based on the filters
    return filterListings(listings, filters);
  }
};
