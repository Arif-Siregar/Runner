import { useAuth } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();           // clears user + localStorage
    navigate("/");      // send back to login
  }

  if (!user) return null; // hide navbar if not logged in

  return (
    <header className="navbar">
      <div className="nav-left">
        <strong>Logged in as:</strong> {user.name} ({user.role})
      </div>

      <div className="nav-right">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
}
