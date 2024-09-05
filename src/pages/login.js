import React, { useState } from "react";
import supabase from "../supabaseClient"; // Import the initialized Supabase client
import "../styles/global.css";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.username.value; // Supabase uses email for auth
    const password = event.target.password.value;

    try {
      // Use Supabase's signIn method for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error; // Throw error to be caught by catch block
      }

      if (data.user) {
        // If login is successful, redirect to the desired page
        localStorage.setItem("username", data.user.email); // Store the username (email in this case)
        window.location.href = "/pregaming"; // Redirect to the desired page
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
