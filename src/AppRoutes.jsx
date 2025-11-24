import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AddPage from "./pages/AddPage";
import ShowPage from "./pages/ShowPage";

export default function AppRoutes() {
  const user = useAuth(); // NOW it works correctly

  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <AddPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/show"
        element={
          <ProtectedRoute>
            <ShowPage />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT REDIRECT */}
      <Route
        path="*"
        element={
          user ? (
            user.role === "FOH" ? (
              <Navigate to="/add" replace />
            ) : (
              <Navigate to="/show" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

    </Routes>
  );
}
