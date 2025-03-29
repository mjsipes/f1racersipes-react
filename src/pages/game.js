import React, { useState, useEffect, useRef } from "react";
import { redirectTo } from "../utils/redirectTo";
import ChatCard from '../components/ChatCard';

import supabase from "../supabaseClient";

/**
 * @typedef {Object} Player
 * @property {string} playerId
 * @property {string} userName
 * @property {string} status
 */

function Game() {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState("");
  const [prompt, setPrompt] = useState(
    "Dolphins are smart sea animals. They eat fish and squid. Dolphins are smart sea animals. They eat fish and squid."
  );
  /**
   * @type {Player[]}
   */
  const [players, setPlayers] = useState([]);

  // Player state
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState("");
  const [numErrors, setNumErrors] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Player stats
  const [accuracy, setAccuracy] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [numCharactersTyped, setNumCharactersTyped] = useState(0);
  const [CPM, setCPM] = useState(0);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const typingInputRef = useRef(null);

  async function getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    setUser(authData.user);
    console.log("authData: ", authData);
    console.log("authError: ", authError);
  }

  useEffect(() => {
    getUser();
  }, []);

  const fetchGameDetails = async (user, setGameId, setGameName) => {
    if (!user) {
      console.log("No user provided");
      return;
    }

    const { data: gamePlayerData, error: gamePlayerError } = await supabase
      .from("game_players")
      .select("*")
      .eq("player_id", user.id)
      .single();

    if (gamePlayerError) {
      console.error("Failed to fetch game player:", gamePlayerError.message);
      return;
    }

    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gamePlayerData.game_id)
      .single();

    if (gameError) {
      console.error("Failed to fetch game:", gameError.message);
      return;
    }

    setGameId(gamePlayerData.game_id);
    setGameName(gameData.game_name);
    return { gamePlayerData, gameData };
  };

  //

  // Fetch Players in a Game
  const fetchPlayers = async (gameId, setPlayers) => {
    if (!gameId) return;

    console.log("Fetching players...");
    try {
      const { data: playersData, error: playersError } = await supabase
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .order("player_id");

      if (playersError || !playersData) {
        throw new Error(playersError || "Players data not found.");
      }

      setPlayers(
        playersData.map((player) => ({
          playerId: player.player_id,
          userName: player.userName,
          status: player.status,
        }))
      );
    } catch (error) {
      console.error("Error fetching players:", error.message);
    }
  };

  //

  // Update Player Status
  const updatePlayerStatus = async () => {
    console.log("Updating player status...");
    if (!gameId || percentComplete === null) return;
    try {
      const { error } = await supabase
        .from("game_players")
        .update({ status: percentComplete })
        .eq("game_id", gameId)
        .eq("player_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      console.log(`Player status updated to ${percentComplete}%`);
    } catch (error) {
      console.error("Error updating player status:", error.message);
    }
  };
  //

  //

  // useEffect(() => {
  //   const setWinner = async () => {
  //     if (!isWinner || !gameId || !user?.id) {
  //       console.log("No winner or game ID or user ID found");
  //       return;
  //     }

  //     try {
  //       const { data: gameWin, error: gameWinError } = await supabase
  //         .from("games")
  //         .update({ winner: user.user_metadata.userName }) // Update winner with the user's ID
  //         .eq("id", gameId) // Ensure the correct game is updated
  //         .single();
  //       console.log("gameWin", gameWin);
  //       console.log("gameWinError", gameWinError);

  //       if (gameWinError) {
  //         throw new Error(gameWinError.message);
  //       }

  //       console.log("Winner updated successfully in games table:", gameWin);
  //     } catch (error) {
  //       console.error("Error updating winner in games table:", error.message);
  //     }
  //   };

  //   setWinner();
  // }, [isWinner, gameId, user]);

  //

  //

  // Subscriptions and Effects
  useEffect(() => {
    // getUserInfo();
  }, []);

  useEffect(() => {
    fetchGameDetails(user, setGameId, setGameName);
  }, [user]);

  useEffect(() => {
    fetchPlayers(gameId, setPlayers);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

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
          fetchPlayers(gameId, setPlayers);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  //

  //
  // useEffect(() => {
  //   if (!gameId) return;
  //   const winnerSubscription = supabase
  //     .channel("game_winners")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "games",
  //         filter: `id=eq.${gameId}`,
  //       },
  //       (payload) => {
  //         console.log("Winner subscription triggered:", payload);
  //         console.log("winner:", payload.new.winner);
  //         if (payload.new.winner !== user.user_metadata.userName) {
  //           setIsWinner(false);
  //           document.getElementById("endOfGameMessage").textContent =
  //             "You lose :(";
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     winnerSubscription.unsubscribe();
  //   };
  // }, [gameId]);

  //

  //

  //

  //

  //

  //

  //
  const handleTypingInput = (event) => {
    console.log("Handling typing input");
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(updateTimer, 1000);
    }

    const newResponse = event.target.value;
    setResponse(newResponse);
    setNumCharactersTyped(newResponse.length);

    updateIsError(newResponse);
    updateAccuracy(newResponse.length);
    updateCPM();
    updatePercentComplete(newResponse);
    updateIsWinnerOrLoser();
  };

  useEffect(() => {
    updatePlayerStatus();
  }, [percentComplete, gameId]);

  const updateTimer = () => {
    const elapsed = (new Date() - startTimeRef.current) / 1000; // Time in seconds
    setTimeElapsed(elapsed.toFixed(0));
    updateCPM();
  };

  const updateIsError = (newResponse) => {
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

  const updateCPM = () => {
    const minutesElapsed = (new Date() - startTimeRef.current) / 1000 / 60;
    const newCPM =
      minutesElapsed > 0 ? (numCharactersTyped / minutesElapsed).toFixed(2) : 0;
    setCPM(newCPM);
  };

  const updatePercentComplete = (newResponse) => {
    if (!isError) {
      const completion = ((newResponse.length / prompt.length) * 100).toFixed(
        2
      );
      setPercentComplete(completion);
      // send("percentComplete", completion);
    }
  };

  const updateIsWinnerOrLoser = () => {
    console.log("updating winner or looser");
    console.log("percentComplete", percentComplete);
    if (parseInt(percentComplete, 10) === 100) {
      setIsWinner(true);
      console.log("You win :)");
      document.getElementById("endOfGameMessage").textContent = "You win :)";
      // send("isWinner", true);
    }
  };

  // Render the prompt with colored characters
  const renderPrompt = () => {
    // Find the index where the error starts (if any)
    let errorIndex = -1;
    for (let i = 0; i < response.length; i++) {
      if (response[i] !== prompt[i]) {
        errorIndex = i;
        break;
      }
    }

    // If there's no error, but the response is longer than the prompt
    if (errorIndex === -1 && response.length > prompt.length) {
      errorIndex = prompt.length;
    }

    // If there's no error at all
    if (errorIndex === -1) {
      // Split the prompt into completed (green) and remaining parts
      const completedPart = prompt.substring(0, response.length);
      const remainingPart = prompt.substring(response.length);

      return (
        <span id="prompt">
          <span style={{ color: "#4CAF50" }}>{completedPart}</span>
          {remainingPart}
        </span>
      );
    } else {
      // There's an error: split into correct, incorrect, and remaining parts
      const correctPart = prompt.substring(0, errorIndex);
      const incorrectPart = response.substring(errorIndex);
      const remainingPart = prompt.substring(errorIndex);

      return (
        <span id="prompt">
          <span style={{ color: "#4CAF50" }}>{correctPart}</span>
          <span style={{ color: "#FF0000" }}>{incorrectPart}</span>
          {remainingPart}
        </span>
      );
    }
  };
  //

  //

  //

  //

  //

  return (
    <>
      <div style={{display:"flex"}}>
        <div className="secondary-container">
          <ChatCard gameId={gameId} />
        </div>
        <div className="game-container">
          <div className="header">
            <img
              src="/F1RacerLogo.png"
              alt="logo"
              className="f1racerlogosmall"
            />
            <h2 className="headerwelcomemessage">
              F1Racer,{" "}
              <span>
                {user?.user_metadata?.email
                  ? user.user_metadata.email
                  : "Guest"}
              </span>
              , playing in
              {gameName}
            </h2>
          </div>
          <span id="playerPositionTable">
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
                    <tr key={player.id} style={{ cursor: "pointer" }}>
                      {Object.entries(player)
                        .filter(([key]) => key !== "playerId")
                        .map(([key, value], index) => (
                          <td key={index}>{value}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </span>
          <div className="prompt">Prompt: {renderPrompt()}</div>
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
          <div className="game-stats-card">
            <div className="stats-header">
              <div className="stats-title">GAME STATS</div>
              <div className="timer-badge">{timeElapsed}s</div>
            </div>
            <div className="stats-main">
              <div className="stats-column">
                <div className="stats-label">CPM</div>
                <div className="stats-value">{CPM}</div>
              </div>
              <div className="vertical-divider"></div>
              <div className="stats-column">
                <div className="stats-label">Characters</div>
                <div className="stats-value">{numCharactersTyped}</div>
              </div>
            </div>
            <div className="stats-progress">
              <div className="stats-column">
                <div className="stats-label">Accuracy</div>
                <div className="stats-value">{percentComplete}%</div>
              </div>
              <div className="progress-container">
                <div className="stats-label">Progress</div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentComplete}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {isError && <div className="error-message">Error detected!</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Game;
