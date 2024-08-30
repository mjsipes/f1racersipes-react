import React, { useState } from "react";
import "../styles/signup.css";

function Signup() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirm_password.value;
    const termsAccepted = event.target.terms.checked;

    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          confirmPassword,
          termsAccepted,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Registration failed.");
      }

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("username", result.username);
        window.location.href = "/pregaming"; // Redirect to the desired page
      } else {
        setErrorMessage(
          result.error || "Registration failed. Please try again."
        );
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
          <label htmlFor="username">username</label>
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
