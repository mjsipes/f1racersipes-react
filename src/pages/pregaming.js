import React from "react";
import "../styles/global.css";
import { useUserProfile } from "../hooks/useUserProfile";

function Pregaming() {
  const { user, loading, error } = useUserProfile();
  console.log(user);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" className="logo1" />
        <h2>
          Prepare to race <span>{user.userName}</span>
        </h2>
      </header>

      <section className="player-stats">
        <p>
          <span>{user.gamesPlayed}</span> games played.{" "}
          <span>{user.gamesWon}</span> games won.{" "}
          <span>{user.totalWordsTyped}</span> total words typed.{" "}
          <span>{user.bestWpm}</span> WPM highscore.
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
