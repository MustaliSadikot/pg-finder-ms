
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { pgListingsAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingForm from "@/components/booking/BookingForm";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Calendar, User, Home, ArrowLeft, Wifi, Coffee, Check, Tv, Car, Shield, ShowerHead, Dumbbell } from "lucide-react";

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isTenant } = useAuth();
  const navigate = useNavigate();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => {
      if (!id) return null;
      return pgListingsAPI.getListingById(id);
    },
  });

  // Function to render amenity icons
  const renderAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-5 w-5" />;
      case "food":
        return <Coffee className="h-5 w-5" />;
      case "ac":
        return <ShowerHead className="h-5 w-5" />;
      case "gym":
        return <Dumbbell className="h-5 w-5" />;
      case "parking":
        return <Car className="h-5 w-5" />;
      case "security":
        return <Shield className="h-5 w-5" />;
      case "tv":
        return <Tv className="h-5 w-5" />;
      default:
        return <Check className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <p>Loading listing details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center min-h-[60vh]">
          <p className="text-xl text-red-500 mb-4">Error loading PG details</p>
          <Button asChild variant="outline">
            <Link to="/listings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/listings"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Image and Title */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
                <div className="relative h-[300px] md:h-[400px]">
                  <img
                    src={listing.imageUrl}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={
                        listing.availability
                          ? "bg-pgfinder-success hover:bg-pgfinder-success/90"
                          : "bg-pgfinder-danger hover:bg-pgfinder-danger/90"
                      }
                    >
                      {listing.availability ? "Available" : "Booked"}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                    <h1 className="text-3xl font-bold">{listing.name}</h1>
                    <p className="text-2xl font-bold text-pgfinder-primary">₹{listing.price}/month</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-1" />
                      <span>For {listing.genderPreference === "any" ? "All" : listing.genderPreference === "male" ? "Males" : "Females"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Home className="h-5 w-5 mr-1" />
                      <span>PG Accommodation</span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Description</h2>
                    <p className="text-gray-600">{listing.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Amenities */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <div className="mr-2 text-pgfinder-primary">
                        {renderAmenityIcon(amenity)}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-1">
            {isAuthenticated && isTenant() ? (
              <BookingForm listing={listing} />
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Interested in this PG?</h2>
                <p className="text-gray-600 mb-4">
                  {isAuthenticated
                    ? "You need a tenant account to book this PG."
                    : "Login or register as a tenant to book this PG."}
                </p>
                <Button asChild className="w-full">
                  <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                    {isAuthenticated ? "Go to Dashboard" : "Login to Book"}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;
