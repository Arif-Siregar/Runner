import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StatisticsLoginPage.css";
import { supabase } from "../supabaseClient";

export default function StatisticsLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username || !password) return alert("Please enter your username and password.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      console.log(error.message);
      alert("Incorrect username or password.")
    } else {
      navigate("/statistics");
    }
  }

  return (
    <div className="loginpage-container">
      <h2>Admin Login</h2>

      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">Username</label>
        <input 
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
        />

        <br /><br />

        <label className="form-label">Password</label>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
          
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
}
