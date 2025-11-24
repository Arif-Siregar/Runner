import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Navbar from "./Navbar";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
        <Navbar />
        <div style={{paddingTop: "60px"}}>
            {children}
        </div>
    </div>
);
}