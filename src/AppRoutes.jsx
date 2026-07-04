import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AddPage from "./pages/AddPage";
import ShowPageBOH from "./pages/ShowPageBOH";
import FeedbackPage from "./pages/FeedbackPage";
import StatisticsPage from "./pages/StatisticsPage";
import StatisticsLoginPage from "./pages/StatisticsLoginPage";


export default function AppRoutes() {
  const {user} = useAuth(); 

  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Feedbacks */}
      <Route 
        path="/feedback" 
        element={
          <ProtectedRoute>
            <FeedbackPage  />
          </ProtectedRoute>
        }
      />
      
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
        path="/showBOH"
        element={
          <ProtectedRoute>
            <ShowPageBOH />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={<StatisticsPage />}
      />

      <Route
        path="/statisticsLogin"
        element={<StatisticsLoginPage />}
      />

      {/* DEFAULT REDIRECT */}
      <Route
        path="*"
        element={
          user ? (
            user.role === "FOH" ? (
              <Navigate to="/add" replace />
            ) : (
              <Navigate to="/showBOH" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

    </Routes>
  );
}
