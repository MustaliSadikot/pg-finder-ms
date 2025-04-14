
import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { pgListingsAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import BookingForm from "@/components/booking/BookingForm";
import {
  MapPin,
  Users,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Home,
  Bed,
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RoomList from "@/components/listings/RoomList";

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => pgListingsAPI.getListingById(id || ""),
    enabled: !!id,
  });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "food":
        return <Utensils className="w-4 h-4" />;
      case "gym":
        return <Dumbbell className="w-4 h-4" />;
      case "parking":
        return <Car className="w-4 h-4" />;
      case "security":
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading listing details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">PG Not Found</h1>
            <p className="mb-6">Sorry, the PG you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/listings">Browse All PGs</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/listings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-72 md:h-96">
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
                    {listing.availability ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{listing.name}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-2xl font-bold text-pgfinder-primary">₹{listing.price}/month</p>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">About this PG</h2>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-pgfinder-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Gender Preference</p>
                          <p className="text-muted-foreground">
                            {listing.genderPreference === "any"
                              ? "Open to All"
                              : listing.genderPreference === "male"
                              ? "Male Only"
                              : "Female Only"}
                          </p>
                        </div>
                      </div>

                      {listing.description && (
                        <div className="flex items-start">
                          <Home className="h-5 w-5 text-pgfinder-primary mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Description</p>
                            <p className="text-muted-foreground">{listing.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="flex items-center gap-1 py-1.5">
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="my-6" />
                
                <RoomList pgId={listing.id} />
              </div>
            </div>
          </div>

          <div>
            <BookingForm listing={listing} />
            
            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-pgfinder-primary" />
                Booking Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-pgfinder-primary font-bold">•</span>
                  Book early to secure your preferred room and bed.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pgfinder-primary font-bold">•</span>
                  Your booking will be confirmed by the PG owner.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pgfinder-primary font-bold">•</span>
                  You can check the status of your booking in your dashboard.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;
