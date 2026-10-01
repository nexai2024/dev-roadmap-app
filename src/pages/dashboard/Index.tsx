import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function DashboardIndex() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard/today" replace />;
}
