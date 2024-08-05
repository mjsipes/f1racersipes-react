import React, { useEffect, useState } from "react";
import "../styles/pregaming.css";

function Pregaming() {
  const [userInfo, setUserInfo] = useState({
    userName: "",
    gamesPlayed: 0,
    gamesWon: 0,
    totalWordsTyped: 0,
    bestWPM: 0,
  });

  useEffect(() => {
    const getuserInfo = () => {
      setUserInfo({
        userName: "hiwqw",
        gamesPlayed: 2,
        gamesWon: 0,
        totalWordsTyped: 0,
        bestWPM: 0,
      });
    };

    getuserInfo();
  }, []);

  return (
    <div className="wrapper">
      <div className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" />
        <h1>
          Prepare to Race, <span id="userName">{userInfo.userName}</span>
        </h1>
      </div>
      {userInfo.userName !== "guest" && (
        <h1 className="player-stats">
          Player Statistics:{" "}
          <span id="gamesPlayed">{userInfo.gamesPlayed}</span> games played.{" "}
          <span id="gamesWon">{userInfo.gamesWon}</span> games won.{" "}
          <span id="totalWordsTyped">{userInfo.totalWordsTyped}</span> total
          words typed. <span id="bestWPM">{userInfo.bestWPM}</span> = WPM
          highscore.
        </h1>
      )}
      <img src="/Racetrack.png" alt="Racetrack" className="racetrack-image" />
      <a href="/startgame" className="button">
        Start Game
      </a>
      <a href="/joingame" className="button">
        Join Game
      </a>
    </div>
  );
}

export default Pregaming;
