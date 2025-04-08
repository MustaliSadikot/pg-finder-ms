
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/button";
import { pgListingsAPI } from "@/services/api";
import { PGListing } from "@/types";
import PGCard from "@/components/listings/PGCard";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, Home, MapPin, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const { data: featuredListings } = useQuery({
    queryKey: ["featuredListings"],
    queryFn: async () => {
      const allListings = await pgListingsAPI.getListings();
      return allListings.filter(listing => listing.availability).slice(0, 3);
    }
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pgfinder-primary to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Find Your Perfect PG Accommodation
            </h1>
            <p className="text-lg md:text-xl mb-8 text-indigo-100">
              Browse thousands of PG listings with detailed information about facilities, 
              amenities, and pricing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
              <Button asChild size="lg" className="bg-white text-pgfinder-primary hover:bg-gray-100">
                <Link to="/listings">
                  <SearchIcon className="h-5 w-5 mr-2" />
                  Find PGs
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/register">
                    <Home className="h-5 w-5 mr-2" />
                    List Your PG
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}></div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PG Finder?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <div className="p-3 bg-blue-50 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-pgfinder-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Range of Locations</h3>
              <p className="text-gray-600">
                Find PGs in all major cities and neighborhoods, close to your workplace or college.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <div className="p-3 bg-orange-50 rounded-full mb-4">
                <Home className="h-8 w-8 text-pgfinder-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">
                All our PG listings are verified to ensure you get accurate information and quality accommodations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
              <div className="p-3 bg-green-50 rounded-full mb-4">
                <Users className="h-8 w-8 text-pgfinder-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and secure booking process with direct communication between tenants and owners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured PGs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured PGs</h2>
            <Button asChild variant="outline">
              <Link to="/listings">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings?.map((listing) => (
              <PGCard key={listing.id} listing={listing} />
            ))}
            {!featuredListings && (
              <div className="col-span-3 text-center py-8">
                <p>Loading featured listings...</p>
              </div>
            )}
            {featuredListings?.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p>No featured listings available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pgfinder-darkblue text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your New Home?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of happy tenants who found their perfect PG accommodation through our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated && (
              <Button asChild size="lg" className="bg-pgfinder-secondary hover:bg-pgfinder-secondary/90 text-white">
                <Link to="/register">Create an Account</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/listings">Browse Listings</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
