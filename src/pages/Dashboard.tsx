
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { pgListingsAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PGCard from "@/components/listings/PGCard";
import BookingList from "@/components/booking/BookingList";
import { Home, Plus, Clock, CalendarCheck } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isOwner, isTenant } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: ownerListings, isLoading: isLoadingListings } = useQuery({
    queryKey: ["ownerListings"],
    queryFn: async () => {
      if (!user || !isOwner()) return [];
      return pgListingsAPI.getOwnerListings(user.id);
    },
    enabled: isAuthenticated && isOwner(),
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>

          {isOwner() && (
            <Button asChild className="mt-4 md:mt-0">
              <Link to="/add-listing">
                <Plus className="mr-2 h-4 w-4" />
                Add New PG
              </Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isOwner() && <TabsTrigger value="listings">My Listings</TabsTrigger>}
            <TabsTrigger value="bookings">
              {isOwner() ? "Booking Requests" : "My Bookings"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      Account Type
                    </CardTitle>
                    <CardDescription>Your role on PG Finder</CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Home className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isOwner() ? "PG Owner" : "Tenant"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {isOwner() ? "Active Listings" : "Active Bookings"}
                    </CardTitle>
                    <CardDescription>
                      {isOwner() ? "Your listed PGs" : "Your current bookings"}
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    {isOwner() ? (
                      <Home className="h-5 w-5" />
                    ) : (
                      <CalendarCheck className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isOwner()
                      ? isLoadingListings
                        ? "..."
                        : ownerListings?.length || 0
                      : "..."}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {isOwner() ? "Pending Requests" : "Pending Bookings"}
                    </CardTitle>
                    <CardDescription>
                      {isOwner() ? "Awaiting your approval" : "Awaiting owner approval"}
                    </CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">...</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/listings">
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Browse PG Listings
                  </Button>
                </Link>
                {isOwner() ? (
                  <Link to="/add-listing">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New PG Listing
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    View My Bookings
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {isOwner() && (
            <TabsContent value="listings">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">My PG Listings</h2>
                <p className="text-gray-500">Manage your listed PG accommodations</p>
              </div>

              {isLoadingListings ? (
                <div className="text-center py-8">Loading your listings...</div>
              ) : ownerListings && ownerListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownerListings.map((listing) => (
                    <PGCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                  <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't added any PG listings yet. Start by adding your first PG.
                  </p>
                  <Button asChild>
                    <Link to="/add-listing">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New PG
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="bookings">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {isOwner() ? "Booking Requests" : "My Bookings"}
              </h2>
              <p className="text-gray-500">
                {isOwner()
                  ? "Manage booking requests for your PGs"
                  : "View your PG booking status"}
              </p>
            </div>

            <BookingList forOwner={isOwner()} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
