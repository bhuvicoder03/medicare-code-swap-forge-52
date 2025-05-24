
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/app.types";

interface PrivateRouteProps {
  children?: React.ReactNode;
  allowedRoles: string[];
}
const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { authState } = useAuth();
  if (!authState.initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!authState.user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(authState.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};
export default PrivateRoute;
