import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

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

    if (role == "FOH"){
      navigate("/add");
    } else {
      navigate("/show")
    };
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="FOH">FOH</option>
            <option value="BOH">BOH</option>
          </select>

        <br /><br />

        {(role === "FOH" ) && (<label>Location</label>)}

        {(role === "FOH" ) &&(              
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            <option value="Cash">Cash</option>
            <option value="Fits">Fits</option>
            <option value="M Pant">M Pant</option>
            <option value="W Pant">W Pant</option>
            <option value="Zone 1">Z1</option>
            <option value="Zone 2">Z2</option>
            <option value="Zone 3">Z3</option>
          </select>)}

        {(role === "FOH" ) &&(<br />)}
        {(role === "FOH" ) &&(<br />)}
          
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
