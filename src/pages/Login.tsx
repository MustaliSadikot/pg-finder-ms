
import React from "react";
import Layout from "@/components/common/Layout";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
