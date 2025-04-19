import React, { useState } from "react";
import supabase from "../supabaseClient";
import { redirectTo } from "../utils/redirectTo";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match.");
      alert("Passwords do not match.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.log("error: ", error);
      alert(error);
      return;
    }
    if (data.user) {
      redirectTo("/pregaming");
    }
  }

  return (
    <div>
      <div className="container">
        <h2 style={{ marginBottom: "20px" }}>Register for F1 Racer</h2>
        <form id="registerForm" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
