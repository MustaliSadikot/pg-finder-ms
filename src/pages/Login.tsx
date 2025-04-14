
import React from "react";
import Layout from "@/components/common/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { Navigate, useLocation } from "react-router-dom";

const Login: React.FC = () => {
  // We'll use the local storage check instead of useAuth to avoid circular dependency
  const isAuthenticated = localStorage.getItem("pgfinder_auth") !== null;
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
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
