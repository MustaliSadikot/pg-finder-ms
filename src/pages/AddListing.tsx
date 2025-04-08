
import React from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import AddListingForm from "@/components/listings/AddListingForm";
import { useAuth } from "@/contexts/AuthContext";
import { pgListingsAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

const AddListing: React.FC = () => {
  const { isAuthenticated, isOwner, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userListings, isLoading } = useQuery({
    queryKey: ["ownerListings", user?.id],
    queryFn: () => (user ? pgListingsAPI.getOwnerListings(user.id) : Promise.resolve([])),
    enabled: !!user && isOwner(),
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOwner()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDelete = async (id: string) => {
    try {
      await pgListingsAPI.deleteListing(id);
      toast({
        title: "Success",
        description: "PG listing deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["ownerListings", user?.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PG listing",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add New PG Listing</h1>
          <p className="text-gray-500">
            Fill in the details below to list your PG accommodation
          </p>
        </div>

        <AddListingForm />

        {userListings && userListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Your PG Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <Card key={listing.id} className="relative">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      {listing.imageUrl && (
                        <img
                          src={listing.imageUrl}
                          alt={listing.name}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{listing.name}</h3>
                    <p className="text-sm text-gray-500">{listing.location}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-semibold">₹{listing.price}/month</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          listing.availability
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.availability ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddListing;
