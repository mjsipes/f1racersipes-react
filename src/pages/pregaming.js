import React from "react";
import "../styles/global.css";
import useUser from "../hooks/useUser";
import { useUserProfile } from "../hooks/useUserProfile";

function Pregaming() {
  const { user, loading: userLoading, error: userError } = useUser();
  console.log("User", user);
  const {
    userProfile,
    loading: profileLoading,
    error: profileError,
  } = useUserProfile();
  console.log("userProfile: ", userProfile);

  if (profileLoading) return <div>Loading...</div>;
  if (profileError) return <div>Error: {profileError}</div>;

  return (
    <div className="container">
      <header className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" className="logo1" />
        <h2>
          Prepare to race <span>{user.user_metadata.userName}</span>
        </h2>
      </header>

      <section className="player-stats">
        <p>
          <span>{userProfile.gamesPlayed}</span> games played.{" "}
          <span>{userProfile.gamesWon}</span> games won.{" "}
          <span>{userProfile.totalWordsTyped}</span> total words typed.{" "}
          <span>{userProfile.bestWpm}</span> WPM highscore.
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
