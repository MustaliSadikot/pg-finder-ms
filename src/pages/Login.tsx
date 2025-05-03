
import React, { useEffect } from "react";
import Layout from "@/components/common/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/dashboard";

  // Effect to redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("User is already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Don't render anything while checking authentication status
  if (isLoading) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If user is authenticated, don't render the login form
  if (isAuthenticated) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default Login;
