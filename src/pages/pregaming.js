import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient"; // Import the initialized Supabase client
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
      console.log("useEffect running... fetching user info from Supabase");

      const { data: user } = await supabase.auth.getUser();
      if (user) {
        const email = user.email;
        console.log("email =", email);

        try {
          const { data: account, error } = await supabase
            .from("accounts")
            .select(
              "gamesplayed, gameswon, totalwordstyped, bestwordsperminute"
            )
            .eq("email", email)
            .single();

          if (error || !account) {
            throw new Error(error ? error.message : "User not found.");
          }

          setUserInfo({
            userName: email,
            gamesPlayed: account.gamesplayed,
            gamesWon: account.gameswon,
            totalWordsTyped: account.totalwordstyped,
            bestWPM: account.bestwordsperminute,
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
  }, [userInfo]); // Logs the state after it has been updated

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
