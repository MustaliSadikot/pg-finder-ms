
import React, { useEffect } from "react";
import Layout from "@/components/common/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const from = location.state?.from || "/dashboard";

  // Check for URL params that might indicate login/auth issues
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: errorDescription || "There was an error during authentication. Please try again.",
        variant: "destructive",
      });
      
      // Clear the URL parameters
      navigate('/login', { replace: true });
    }
  }, [location, toast, navigate]);

  // Effect to get current session
  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session check:", sessionData.session?.user?.email || "No session");
    };
    
    checkSession();
  }, []);

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
