
import React from "react";
import Layout from "@/components/common/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
};

export default Register;
