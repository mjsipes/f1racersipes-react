import React from "react";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function Pregaming() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    setUser(authData.user);
    console.log("authData: ", authData);
    if (authError){
      console.log("authError: ", authError);
      alert(authError);
    }
  }

  async function getUserProfile(user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);
    console.log("profile: ", profile);
    if (profileError){
      console.log("profileError: ", profileError);
      alert(profileError);
    }
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
        <img src="F1RacerLogo.png" alt="this is the logo" className="f1racerlogo" />
        <h2>
          {"Prepare to race "}
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

      <img src="/Racetrack.png" alt="this is the racetrack" className="racetrack-image" />

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
