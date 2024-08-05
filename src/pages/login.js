import React, { useState } from "react";
import "../styles/login.css";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;

    // Here, you can add your JavaScript logic for form submission
    // For example, you could simulate a login process:
    if (username === "user" && password === "pass") {
      window.location.href = "/pregaming"; // Change to your next page URL
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Log In to F1 Racer</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />

          <button type="submit" className="button">
            Log In
          </button>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
