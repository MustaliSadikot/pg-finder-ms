
import React, { useEffect } from "react";
import Layout from "@/components/common/Layout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Register: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for any error parameters in the URL (coming from Supabase redirect)
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      toast({
        title: "Registration Error",
        description: errorDescription || "There was an error during registration. Please try again.",
        variant: "destructive",
      });
      
      // Clear URL parameters after displaying the error
      navigate('/register', { replace: true });
    }
  }, [toast, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[60vh] flex items-center justify-center">
          <p>Checking authentication status...</p>
        </div>
      </Layout>
    );
  }

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
