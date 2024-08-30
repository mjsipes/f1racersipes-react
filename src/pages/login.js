import React, { useState } from "react";
import "../styles/login.css";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("username", result.username);
        window.location.href = "/pregaming"; // Redirect to the desired page
      } else {
        setErrorMessage(result.error || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Log In to F1 Racer</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="username">username</label>
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
