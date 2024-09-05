import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import "../styles/global.css";

function Pregaming() {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    gamesPlayed: 0,
    gamesWon: 0,
    totalWordsTyped: 0,
    bestWPM: 0,
  });

  const [isUserFetched, setIsUserFetched] = useState(false); // Add a state to track if the user is fetched

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: user } = await supabase.auth.getUser();
      console.log("user =", user);
      const id = user?.user?.id;
      if (id) {
        try {
          let { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .single();

          if (error || !profile) {
            throw new Error(error ? error.message : "User not found.");
          }
          console.log("profile =", profile);

          setUserInfo({
            userName: profile.username,
            gamesPlayed: profile.games_played,
            gamesWon: profile.games_won,
            totalWordsTyped: profile.total_words_typed,
            bestWPM: profile.best_words_per_minute,
          });
          setIsUserFetched(true);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    getUserInfo();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" className="logo1" />
        <h2>
          Prepare to race <span>{userInfo.userName}</span>
        </h2>
      </header>

      <section
        className="player-stats"
        style={{ display: isUserFetched ? "block" : "none" }}
      >
        <p>
          <span>{userInfo.gamesPlayed}</span> games played.{" "}
          <span>{userInfo.gamesWon}</span> games won.{" "}
          <span>{userInfo.totalWordsTyped}</span> total words typed.{" "}
          <span>{userInfo.bestWPM}</span> WPM highscore.
        </p>
      </section>

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
