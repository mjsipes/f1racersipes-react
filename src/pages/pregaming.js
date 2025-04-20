import React from "react";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function Pregaming() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function fetchUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log("authError: ", authError);
      alert(authError);
    }
    setUser(authData.user);
    console.log("authData: ", authData);
  }

  async function fetchUserProfile(user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileError) {
      console.log("profileError: ", profileError);
      alert(profileError);
    }
    setUserProfile(profile);
    console.log("profile: ", profile);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile(user);
    }
  }, [user]);

  return (
    <div className="container">
      <header className="header">
        <img
          src="F1RacerLogo.png"
          alt="this is the logo"
          className="f1racerlogosmall"
        />
        <h2>
          {"Prepare to race "}
          {user?.user_metadata?.full_name && (
            <span>{user.user_metadata.full_name}</span>
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

      <img
        src="/Racetrack.png"
        alt="this is the racetrack"
        className="racetrack-image"
      />

      <div className="buttons">
        <button
          className="button"
          onClick={() => (window.location.href = "/startgame")}
        >
          Start Game
        </button>
        <button
          className="button"
          onClick={() => (window.location.href = "/joingame")}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default Pregaming;
