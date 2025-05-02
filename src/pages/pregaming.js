import React from "react";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import Header from "../components/Header";
import CountUp from "react-countup";

function Pregaming() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    games_played: 0,
    gamesWon: 0,
    total_words_typed: 0,
    best_wpm: 0,
  });

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
    <>
      <Header />
      <div className="container-w-nav">
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

        {/* Stats section with fixed height to prevent layout shift */}
        <section className="player-stats">
          <p>
            <span className="stat-number">
              <CountUp end={userProfile.games_played} />
            </span>{" "}
            games played.{" "}
            <span className="stat-number">
              <CountUp end={userProfile.gamesWon} />
            </span>{" "}
            games won.{" "}
            <span className="stat-number stat-number-large">
              <CountUp end={userProfile.total_words_typed} />
            </span>{" "}
            total words typed.{" "}
            <span className="stat-number">
              <CountUp end={userProfile.best_wpm} />
            </span>{" "}
            WPM highscore.
          </p>
        </section>

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
    </>
  );
}

export default Pregaming;
