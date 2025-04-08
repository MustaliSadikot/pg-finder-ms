
import React from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import AddListingForm from "@/components/listings/AddListingForm";
import { useAuth } from "@/contexts/AuthContext";

const AddListing: React.FC = () => {
  const { isAuthenticated, isOwner } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOwner()) {
    return <Navigate to="/dashboard" replace />;
  }

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
      </div>
    </Layout>
  );
};

export default AddListing;
