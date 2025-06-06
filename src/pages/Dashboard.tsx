
import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { pgListingsAPI, bookingsAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PGCard from "@/components/listings/PGCard";
import BookingList from "@/components/booking/BookingList";
import { Home, Plus, Clock, CalendarCheck, AlertCircle } from "lucide-react";

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

  // Query to fetch pending booking requests
  const { data: pendingBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["pendingBookings"],
    queryFn: async () => {
      if (!user) return [];
      
      if (isOwner()) {
        // For owners: Get all bookings for their PGs and filter for pending ones
        const listings = await pgListingsAPI.getOwnerListings(user.id);
        const bookingsPromises = listings.map(listing => bookingsAPI.getPGBookings(listing.id));
        const bookingsArrays = await Promise.all(bookingsPromises);
        const allBookings = bookingsArrays.flat();
        return allBookings.filter(booking => booking.status === 'pending');
      } else {
        // For tenants: Get their bookings and filter for pending ones
        const bookings = await bookingsAPI.getTenantBookings(user.id);
        return bookings.filter(booking => booking.status === 'pending');
      }
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // If there are pending bookings/requests, set the active tab to pending for better visibility
    if (pendingBookings && pendingBookings.length > 0 && activeTab === "overview") {
      setActiveTab("pending");
    }
  }, [pendingBookings]);

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
            <TabsTrigger value="pending" className="relative">
              {pendingBookings && pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
              {isOwner() ? "Pending Approvals" : "Pending Requests"}
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

              <Card className={pendingBookings && pendingBookings.length > 0 ? "border-red-200 shadow-md" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {isOwner() ? "Pending Requests" : "Pending Bookings"}
                    </CardTitle>
                    <CardDescription>
                      {isOwner() ? "Awaiting your approval" : "Awaiting owner approval"}
                    </CardDescription>
                  </div>
                  <div className={`p-2 rounded-full ${pendingBookings && pendingBookings.length > 0 ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary"}`}>
                    {pendingBookings && pendingBookings.length > 0 ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                      {isLoadingBookings ? "..." : pendingBookings?.length || 0}
                    </div>
                    {pendingBookings && pendingBookings.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab("pending")}
                        className="text-sm"
                      >
                        View All
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {pendingBookings && pendingBookings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-700">
                    {isOwner() ? "Pending approvals require your attention" : "You have pending booking requests"}
                  </h3>
                  <p className="text-sm text-yellow-600">
                    {isOwner() 
                      ? `You have ${pendingBookings.length} booking request${pendingBookings.length > 1 ? 's' : ''} waiting for your approval.` 
                      : `You have ${pendingBookings.length} booking request${pendingBookings.length > 1 ? 's' : ''} waiting for owner approval.`}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-white hover:bg-white border-yellow-300 text-yellow-700 hover:text-yellow-800"
                    onClick={() => setActiveTab("pending")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {isOwner() ? "Review Requests" : "View Pending Requests"}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/listings">
                    <Home className="mr-2 h-4 w-4" />
                    Browse PG Listings
                  </Link>
                </Button>
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
          
          <TabsContent value="pending">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {isOwner() ? "Pending Approval Requests" : "My Pending Requests"}
              </h2>
              <p className="text-gray-500">
                {isOwner()
                  ? "These requests need your approval"
                  : "These are your pending booking requests"}
              </p>
            </div>
            
            {isLoadingBookings ? (
              <div className="text-center py-4">Loading pending requests...</div>
            ) : pendingBookings && pendingBookings.length > 0 ? (
              <BookingList forOwner={isOwner()} pendingOnly={true} />
            ) : (
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-gray-500 mb-4">
                  {isOwner()
                    ? "You don't have any pending booking requests right now."
                    : "You don't have any pending booking requests right now."}
                </p>
                <Button asChild variant="outline">
                  <Link to={isOwner() ? "/add-listing" : "/listings"}>
                    {isOwner() ? (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New PG
                      </>
                    ) : (
                      <>
                        <Home className="mr-2 h-4 w-4" />
                        Browse PG Listings
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
