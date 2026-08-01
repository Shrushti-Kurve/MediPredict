import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import bgImage from "../assets/healthcare-bg.jpg";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login Successful");
    navigate("/dashboard");
  };

  return (

    <div
      className="login-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      <div className="logo-area">

        <img src={logo} alt="logo" />

        <h2>MediPredict</h2>

      </div>

      <form
        className="login-box"
        onSubmit={handleLogin}
      >

        <h1>Welcome Back 👋</h1>

        <p className="subtitle">
          Rural Healthcare Analytics Platform
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
        >
          <option>Admin</option>
          <option>Doctor</option>
          <option>Hospital Staff</option>
          <option>Pharmacist</option>
        </select>

        <div className="options">

          <label>

            <input type="checkbox"/>

            Remember Me

          </label>

          <a href="#">Forgot Password?</a>

        </div>

        <button type="submit">
          Login
        </button>

        <button
          type="button"
          className="register-btn"
        >
          Create New Account
        </button>

      </form>

    </div>

  );
}

export default Login;