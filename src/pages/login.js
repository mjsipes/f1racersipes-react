import React, { useState } from "react";
import supabase from "../supabaseClient";
import "../styles/global.css";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.username.value;
    const password = event.target.password.value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        window.location.href = "/pregaming";
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage(
        error.message || "An error occurred during login. Please try again."
      );
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Log In to F1 Racer</h2>
        <form id="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="username">Email</label>{" "}
          {/* Supabase uses email for login */}
          <input type="email" id="username" name="username" required />
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
