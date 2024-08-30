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
    const getUserInfo = async () => {
      console.log("useEffect running... username grabbed from local storage");
      const username = localStorage.getItem("username");
      console.log("username =", username);

      if (username) {
        try {
          const response = await fetch("http://localhost:3001/get-user-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          });

          if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || "Error fetching user data.");
          }

          const data = await response.json();
          console.log("data =", data);

          // Update state only if the account data is found
          setUserInfo({
            userName: username,
            gamesPlayed: data.gamesPlayed,
            gamesWon: data.gamesWon,
            totalWordsTyped: data.totalWordsTyped,
            bestWPM: data.bestWPM,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    console.log("Updated userInfo = ", userInfo);
  }, [userInfo]); // This will log the state after it has been updated
  console.log(document.cookie);

  return (
    <div className="wrapper">
      <div className="header">
        <img src="F1RacerLogo.png" alt="F1 Racer Logo" />
        <h1>
          Prepare to Race, <span id="userName">{userInfo.userName}</span>
        </h1>
      </div>
      <div>
        <h1 className="player-stats">
          Player Statistics:{" "}
          <span id="gamesPlayed">{userInfo.gamesPlayed}</span> games played.{" "}
          <span id="gamesWon">{userInfo.gamesWon}</span> games won.{" "}
          <span id="totalWordsTyped">{userInfo.totalWordsTyped}</span> total
          words typed. <span id="bestWPM">{userInfo.bestWPM}</span> = WPM
          highscore.
        </h1>
      </div>
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
