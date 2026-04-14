import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !role) return alert("Please enter your name and role.");

    login(name, role, location);

    if (role === "FOH"){
      navigate("/add");
    } else {
      navigate("/show")
    };
  }

  return (
    <div className="loginpage-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">Name</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
        />

        <br /><br />

        <label className="form-label">Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="form-input"
          >
            <option value="">Select Role</option>
            <option value="FOH">FOH</option>
            <option value="BOH">BOH</option>
          </select>

        <br /><br />

        {(role === "FOH" ) && (<label className="form-label">Location</label>)}

        {(role === "FOH" ) &&(              
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
          >
            <option value="">Select Location</option>
            <option value="Cash">Cash</option>
            <option value="Fits">Fits</option>
            <option value="Men's">Men's</option>
            <option value="W Pant">W Pant</option>
            <option value="Zone 1">Z1</option>
            <option value="Zone 2">Z2</option>
            <option value="Zone 3">Z3</option>
            <option value="Zone 4">Z4</option>
          </select>)}

        {(role === "FOH" ) &&(<br />)}
        {(role === "FOH" ) &&(<br />)}
          
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
}
