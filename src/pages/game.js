import React, { useState, useEffect, useRef } from "react";
import { redirectTo } from "../utils/redirectTo";
import Chat from "../components/Chat";
import GameStats from "../components/GameStats";
import PromptDisplay from "../components/PromptDisplay";
import Header from "../components/Header";
import supabase from "../supabaseClient";
import updatePlayerProfile from "../utils/updatePlayerProfile.js";

function Game() {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [prompt, setPrompt] = useState(null);

  const [players, setPlayers] = useState([]);

  // Player state
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState("");
  const [numErrors, setNumErrors] = useState(0);
  const [isError, setIsError] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Player stats - modified to track words instead of characters
  const [accuracy, setAccuracy] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [numWordsTyped, setNumWordsTyped] = useState(0);
  const [WPM, setWPM] = useState(0);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const typingInputRef = useRef(null);
  // Create a ref to track the current words typed count
  const wordsTypedRef = useRef(0);

  //----------------------------------------------------------------------------
  async function fetchUser() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("userData: ", userData);
    console.log("userError: ", userError);
    setUser(userData.user);
  }
  useEffect(() => {
    fetchUser();
  }, []);
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  async function fetchGameId(user) {
    if (!user) {
      console.log("No user provided");
      return;
    }
    const { data: gamePlayerData, error: gamePlayerError } = await supabase
      .from("game_players")
      .select("game_id")
      .eq("player_id", user.id)
      .single();
    if (gamePlayerError) {
      console.log("Failed to fetch game player:", gamePlayerError.message);
      alert("Failed to fetch game player:", gamePlayerError.message);
      return;
    }
    console.log("gamePlayerData: ", gamePlayerData);
    setGameId(gamePlayerData.game_id);
  }
  useEffect(() => {
    if (user) {
      fetchGameId(user);
    }
  }, [user]);
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  async function fetchGameDetails(gameId) {
    console.log("fetchingGameDetails");
    if (!gameId) {
      console.log("No gameId provided");
      return;
    }
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();
    if (gameError) {
      console.log("Failed to fetch game:", gameError.message);
      alert("Failed to fetch game:", gameError.message);
      return;
    }
    console.log("gameData: ", gameData);
    setGameData(gameData);
    if (gameData.prompt) {
      setPrompt(gameData.prompt);
    }
    if (gameData.winner) {
      setWinnerDisplay(gameData);
      console.log("wpm", WPM);
      updatePlayerProfile(gameData, user, wordsTypedRef.current, WPM);
    }
  }

  useEffect(() => {
    if (gameId) {
      fetchGameDetails(gameId);
      const subscription = supabase
        .channel("games")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "games",
            filter: `id=eq.${gameId}`,
          },
          (payload) => {
            console.log("Game details subscription triggered:", payload);
            fetchGameDetails(gameId);
          }
        )
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameId]);
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  async function fetchPlayers(gameId) {
    if (!gameId) {
      console.log("No gameId provided");
      return;
    }
    console.log("Fetching players...");
    const { data: playersData, error: playersError } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("player_id");
    if (playersError) {
      console.log("Failed to fetch players:", playersError.message);
      alert("Failed to fetch players:", playersError.message);
      return;
    }
    if (!playersData) {
      console.log("No player data found.");
      return;
    }
    setPlayers(
      playersData.map((player) => ({
        playerId: player.player_id,
        username: player.username,
        status: player.status,
      }))
    );
  }

  useEffect(() => {
    if (!gameId) return;

    fetchPlayers(gameId);
    const subscription = supabase
      .channel("game_players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log("Game players subscription triggered:", payload);

          fetchPlayers(gameId);
        }
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  async function updatePlayerStatus() {
    console.log("Updating player status...");
    if (!gameId || percentComplete === null) return;
    const { error } = await supabase
      .from("game_players")
      .update({ status: percentComplete })
      .eq("game_id", gameId)
      .eq("player_id", user.id);
    if (error) {
      console.log("Error updating player status:", error.message);
      alert("Error updating player status:", error.message);
      return;
    }
    console.log(`Player status updated to ${percentComplete}%`);
  }

  useEffect(() => {
    updatePlayerStatus();
  }, [percentComplete]);

  //----------------------------------------------------------------------------

  // Helper function to count words in a string
  const countWords = (text) => {
    // Trim the text and split by whitespace
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  // Get total words in prompt
  const getTotalPromptWords = () => {
    return prompt ? countWords(prompt) : 0;
  };

  //----------------------------------------------------------------------------
  function handleTypingInput(event) {
    console.log("\n");
    console.log("Handling typing input");
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(updateTimer, 1000);
    }

    const newResponse = event.target.value;
    setResponse(newResponse);

    const wordCount = countWords(newResponse);
    setNumWordsTyped(wordCount);
    wordsTypedRef.current = wordCount;

    updateIsError(newResponse);
    updateAccuracy(newResponse.length);
    updateWPM();
    updatePercentComplete(newResponse);
    console.log("\n");
  }

  const updateTimer = () => {
    const elapsed = (new Date() - startTimeRef.current) / 1000;
    setTimeElapsed(elapsed.toFixed(0));
    updateWPM();
  };

  const updateIsError = (newResponse) => {
    if (!prompt) return;
    const error = !prompt.startsWith(newResponse);
    setIsError(error);
    if (error && newResponse.length > 0) {
      setNumErrors((prevErrors) => prevErrors + 1);
    }
  };

  const updateAccuracy = (charactersTyped) => {
    const accuracyValue = 1 - numErrors / charactersTyped;
    setAccuracy(accuracyValue);
  };

  const updateWPM = () => {
    const minutesElapsed = (new Date() - startTimeRef.current) / 1000 / 60;
    const newWPM =
      minutesElapsed > 0
        ? (wordsTypedRef.current / minutesElapsed).toFixed(2)
        : 0;
    setWPM(newWPM);
  };

  const updatePercentComplete = (newResponse) => {
    if (!isError && prompt) {
      const completion = ((newResponse.length / prompt.length) * 100).toFixed(
        2
      );
      setPercentComplete(completion);
      if (parseFloat(completion) >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  //----------------------------------------------------------------------------

  function setWinnerDisplay(gameData) {
    const gameStatsCard = document.querySelector(".game-stats-card");
    const gameHeader = document.querySelector(".game-header");
    const chatCard = document.querySelector(".chat-card");

    if (gameData.winner == user.id) {
      gameStatsCard.style.background = "lightgreen";
      gameHeader.style.background = "lightgreen";
      chatCard.style.background = "lightgreen";
      console.log("you win");
      setTimeout(() => {
        alert("You win!");
      }, 50);
    } else {
      gameStatsCard.style.background = "lightcoral";
      gameHeader.style.background = "lightcoral";
      chatCard.style.background = "lightcoral";
      console.log("you lose");
      setTimeout(() => {
        alert("You lose!");
      }, 50);
    }
  }

  return (
    <>
      <Header />
      <div style={{ display: "flex" }}>
        <div className="secondary-container">
          <Chat gameId={gameId} />
        </div>
        <div className="game-container">
          <div className="game-header">
            <img
              src="/F1RacerLogo.png"
              alt="logo"
              className="f1racerlogosmall"
            />
            <h2>
              <div style={{ textAlign: "left" }}>
                F1Racer: {user?.user_metadata?.full_name}
              </div>
              <div style={{ textAlign: "left" }}>
                Game Server: {gameData?.game_name}
              </div>
            </h2>
          </div>
          <div id="playerPositionTable">
            {players.length > 0 && (
              <table>
                <thead>
                  <tr>
                    {Object.keys(players[0])
                      .filter((key) => key !== "playerId")
                      .map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.playerId} style={{ cursor: "pointer" }}>
                      {Object.entries(player)
                        .filter(([key]) => key !== "playerId")
                        .map(([key, value]) => (
                          <td key={`${player.playerId}-${key}`}>{value}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <PromptDisplay prompt={prompt} response={response} />
          <br />
          <input
            type="text"
            id="typingInput"
            placeholder="Start typing..."
            ref={typingInputRef}
            onInput={handleTypingInput}
          />
          <br />
          <button className="button" onClick={() => redirectTo("/pregaming")}>
            Exit Game
          </button>
        </div>
        <div className="secondary-container">
          <GameStats
            timeElapsed={timeElapsed}
            WPM={WPM}
            numWordsTyped={wordsTypedRef.current}
            percentComplete={percentComplete}
            isError={isError}
          />
        </div>
      </div>
    </>
  );
}

export default Game;
