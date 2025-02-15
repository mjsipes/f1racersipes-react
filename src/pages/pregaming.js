import React from "react";
import { useState, useEffect } from "react";
import "../styles/global.css";
import supabase from "../supabaseClient";

function Pregaming() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    setUser(authData.user);
    console.log("authData: ", authData);
    console.log("authError: ", authError);
  }

  async function getUserProfile(user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);
    console.log("profile: ", profile);
    console.log("profileError: ", profileError);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile(user);
    }
  }, [user]);

  return (
    <div className="container">
      <header className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" className="logo1" />
        <h2>
          Prepare to race{" "}
          {user?.user_metadata?.userName && (
            <span>{user.user_metadata.userName}</span>
          )}
        </h2>
      </header>
      {userProfile && (
        <section className="player-stats">
          <p>
            <span>{userProfile.gamesPlayed}</span> games played.{" "}
            <span>{userProfile.gamesWon}</span> games won.{" "}
            <span>{userProfile.totalWordsTyped}</span> total words typed.{" "}
            <span>{userProfile.bestWpm}</span> WPM highscore.
          </p>
        </section>
      )}

      <img src="/Racetrack.png" alt="Racetrack" className="racetrack-image" />

      <div className="button-group">
        <a href="/startgame" className="button">
          Start Game
        </a>
        <a href="/joingame" className="button">
          Join Game
        </a>
      </div>
    </div>
  );
}

export default Pregaming;
