import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CustomerDashboard from "./CustomerDashboard";
import ShopDashboard from "./ShopDashboard";

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/profile" replace />;
  }

  return profile.userType === "customer" ? (
    <CustomerDashboard />
  ) : (
    <ShopDashboard />
  );
};

export default Dashboard;
