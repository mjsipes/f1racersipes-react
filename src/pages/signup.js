import React, { useState } from "react";
import "../styles/signup.css";

function Signup() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirm_password.value;
    const termsAccepted = event.target.terms.checked;

    if (!termsAccepted) {
      setErrorMessage("You must accept the terms and conditions.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Simulate a registration process
    if (username === "newuser") {
      window.location.href = "/pregaming"; // Change to your next page URL
    } else {
      setErrorMessage("Registration failed. Username already exists.");
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Register for F1 Racer</h2>
        <form id="registerForm" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />

          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            required
          />

          <div className="checkbox">
            <input type="checkbox" id="terms" name="terms" required />
            <label htmlFor="terms" className="terms">
              I accept the <a href="terms.html">Terms of Service</a> and{" "}
              <a href="privacy.html">Privacy Policy</a>.
            </label>
          </div>

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
