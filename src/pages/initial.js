import React, { useState } from "react";
import supabase from "../supabaseClient";
import { redirectTo } from "../utils/redirectTo";

function Initial() {
  console.log(window.performance);
  console.log(window.localStorage);

  const handlePlayAsGuest = async (event) => {
    event.preventDefault();
    const isConfirmed = window.confirm(
      "When you play as a guest, your information will not be saved. Do you want to continue?"
    );

    if (isConfirmed) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInAnonymously();
      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          data: { userName: "guest", full_name: "guest" },
        });
      redirectTo("/pregaming");
    }
  };

  return (
    <div className="container">
      <h2>Welcome to F1 Racer</h2>
      <img src="/F1RacerLogo.png" alt="F1 Racer Logo" className="logo" />
      <p>
        Experience the thrill of racing and typing as you compete against others
        or against the clock. Will you cross the finish line first?
      </p>
      <div className="button-group">
        <button className="button" onClick={() => redirectTo("/login")}>
          Log In
        </button>
        <button className="button" onClick={() => redirectTo("/signup")}>
          Register
        </button>
        <button className="button" onClick={handlePlayAsGuest}>
          Play as Guest
        </button>
      </div>
    </div>
  );
}

export default Initial;
