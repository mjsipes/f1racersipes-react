import React, { useState, useEffect, useRef } from "react";
import { redirectTo } from "../utils/redirectTo";
import Chat from "../components/Chat";
import GameStats from "../components/GameStats";
import supabase from "../supabaseClient";

function Game() {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [prompt, setPrompt] = useState(
    "Dolphins are smart sea animals. They eat fish and squid. Dolphins are smart sea animals. They eat fish and squid."
  );

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

  //----------------------------------------------------------------------------
  async function fetchUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log("authData: ", authData);
    console.log("authError: ", authError);
    setUser(authData.user);
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
          fetchPlayers(gameId, setPlayers);
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
  //----------------------------------------------------------------------------

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
    const elapsed = (new Date() - startTimeRef.current) / 1000;
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
            <h2 className="headerwelcomemessage">
              F1Racer, <span>{user?.user_metadata?.full_name}</span>, playing in{" "}
              {gameData?.game_name}
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
          <GameStats
            timeElapsed={timeElapsed}
            CPM={CPM}
            numCharactersTyped={numCharactersTyped}
            percentComplete={percentComplete}
            isError={isError}
          />
        </div>
      </div>
    </>
  );
}

export default Game;
