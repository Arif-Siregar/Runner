import { Link } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Running App</h1>

      <nav className="app-nav">
        <Link to="/add" className="app-button add">
          Add Order
        </Link>

        <Link to="/show" className="app-button view">
          View Order
        </Link>
      </nav>
    </div>
  );
}
