import React from "react";
import { redirectTo } from "../utils/redirectTo";
import supabase from "../supabaseClient";

function Header() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    } else {
      redirectTo("/");
    }
  };

  return (
    <header className="header-nav">
      <button className="nav-button" onClick={() => redirectTo("/pregaming")}>
        Pregaming
      </button>
      <button className="nav-button" onClick={() => redirectTo("/startgame")}>
        Start Game
      </button>
      <button className="nav-button" onClick={() => redirectTo("/joingame")}>
        Join Game
      </button>
      <button className="nav-button logout" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Header;
