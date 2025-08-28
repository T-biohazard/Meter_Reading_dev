import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

/**
 * A private route that redirects unauthenticated users to the login page.
 * If 'allowedRoles' is provided, the user must have one of those roles to access the route.
 * Otherwise, it only checks for general authentication.
 *
 * @param {object} props - Component props.
 * @param {string[]} [props.allowedRoles] - An optional array of role names.
 */
export default function ProtectedRoute({ allowedRoles }) {
  // Access the user, authentication status, and new loading state from AuthContext.
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Step 1: Wait until the authentication check from localStorage is complete.
  // This is crucial to prevent premature redirects on a page refresh.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Step 2: If the user is not authenticated after the check, redirect to login.
  if (!isAuthenticated) {
    // Pass the current location to the login page so the user can be redirected back
    // to their intended destination after a successful login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Step 3: If authenticated but a role is required, check if the user has an allowed role.
  // The 'user' object is guaranteed to exist at this point.
  // We use .some() to check if ANY of the user's roles match an allowed role.
  const userHasRequiredRole = allowedRoles
    ? allowedRoles.some((role) => user?.roles?.some((userRole) => userRole.name === role))
    : true;

  // If the user lacks the required role, redirect them to the "Not Authorized" page.
  if (!userHasRequiredRole) {
    return <Navigate to="/403" replace />;
  }

  // If all checks pass, render the child routes.
  return <Outlet />;
}
