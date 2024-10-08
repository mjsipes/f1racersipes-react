import React, { useState } from "react";
import supabase from "../supabaseClient";
import "../styles/global.css";

function Signup() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.username.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirm_password.value;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
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
      console.error("Error during registration:", error);
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Register for F1 Racer</h2>
        <form id="registerForm" onSubmit={handleSubmit}>
          <label htmlFor="username">Email</label>{" "}
          <input type="email" id="username" name="username" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            required
          />
          <button type="submit" className="button">
            Register
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Signup;
