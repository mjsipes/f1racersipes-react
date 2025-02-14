import React, { useState, useEffect, useRef } from "react";
import supabase from "../supabaseClient";
import "../styles/game.css";

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
    "Dolphins are smart sea animals. They eat fish and squid."
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

  const [messages, setMessages] = useState([]); // List of messages
  const [newMessage, setNewMessage] = useState(""); // Message input

  async function getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    setUser(authData.user);
    console.log("authData: ", authData);
    console.log("authError: ", authError);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase.channel(`game-${gameId}`);
    console.log("channel", channel);

    // Listen for incoming messages
    channel
      .on("broadcast", { event: "new-message" }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload]);
      })
      .subscribe();

    // Cleanup on component unmount
    return () => {
      channel.unsubscribe();
    };
  }, [gameId]); // Re-run this effect if gameId changes

  const sendMessage = async () => {
    if (newMessage.trim() !== "" && gameId) {
      // Broadcast the message to other clients in the game-specific channel
      await supabase.channel(`game-${gameId}`).send({
        type: "broadcast",
        event: "new-message",
        payload: {
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      setNewMessage(""); // Clear the input field
    }
  };

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
  //

  //

  //

  //

  //

  return (
    <div className="container">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h2>
          F1Racer,{" "}
          <span>
            {user?.user_metadata?.email ? user.user_metadata.email : "Guest"}
          </span>
          , playing in
          {gameName}
          <span id="gameServerName"></span>
          <span id="endOfGameMessage"></span>
        </h2>
      </div>

      <h1 className="game-stats">
        Game Statistics:{" "}
        <span id="numCharactersTyped">{numCharactersTyped}</span> characters
        typed.
        <span id="CPM">{CPM}</span> CPM.{" "}
        <span id="isError">{isError.toString()}</span> = isError.
        <span id="timer">{timeElapsed}</span> seconds.{" "}
        <span id="percentComplete">{percentComplete}</span>% complete.
      </h1>

      <span id="carPosition"></span>

      <span id="playerPositionTable">
        {players.length > 0 && (
          <table>
            <thead>
              <tr>
                {/* Filter out "playerId" from keys */}
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
                  {/* Filter out "playerId" from values */}
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

      <p>
        Prompt: <span id="prompt">{prompt}</span>
      </p>

      <br />
      <input
        type="text"
        id="typingInput"
        placeholder="Start typing..."
        ref={typingInputRef}
        onInput={handleTypingInput}
      />
      <br />
      <div id="response">{response}</div>

      <a href="/pregaming" className="button">
        Exit Game
      </a>
      <div>
        <h2>Simple Chat</h2>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <span>{msg.payload.timestamp}: </span>
              {msg.payload.content}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Game;
