import React, { useState } from "react";
import supabase from "../supabaseClient";
import { redirectTo } from "../utils/redirectTo";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
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
        <h2 style={{ marginBottom: "20px" }}>Log In to F1 Racer</h2>

        <form id="loginForm" onSubmit={handleSubmit}>
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
          <button type="submit" className="button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
