import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-purple-500"></span>

          <p className="mt-4 text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;