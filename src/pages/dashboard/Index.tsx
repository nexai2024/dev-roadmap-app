import { Navigate } from "react-router";

export default function DashboardIndex() {
  return <Navigate to="/dashboard/today" replace />;
}
