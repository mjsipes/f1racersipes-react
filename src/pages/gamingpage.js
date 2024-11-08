import React, { useState, useEffect, useRef } from "react";
import supabase from "../supabaseClient";
import "../styles/gamingpage.css";

/**
 * @typedef {Object} Player
 * @property {string} playerId
 * @property {string} userName
 * @property {string} status
 */

function GamingPage() {
  const [userInfo, setUserInfo] = useState({
    id: "",
    userName: "",
    gamesPlayed: 0,
    gamesWon: 0,
    totalWordsTyped: 0,
    bestWPM: 0,
  });

  interface Player {
    playerId: string; // or number, depending on the type of player_id in your database
    userName: string;
    status: string;
  }

  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState("");
  /**
   * @type {Player[]}
   */
  const [players, setPlayers] = useState([]); // Player array state
  const [isLoading, setIsLoading] = useState(true);

  //game state
  const [gameStart, setGameStart] = useState(false);
  const [gameStop, setGameStop] = useState(false);
  const [prompt, setPrompt] = useState("whois@43"); // Initial prompt state

  // Player state
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

  // Use refs for other state values that require preservation across renders
  const typingInputRef = useRef(null);

  //

  //

  //

  //

  //

  //
  // getUserInfo
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: user, error: authError } = await supabase.auth.getUser();
        console.log("user: ", user);
        console.log("error: ", authError);

        const userId = user.user.id;
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError || !profile) {
          console.error("Profile error:", profileError);
          return;
        }

        console.log("Profile fetched:", profile);

        setUserInfo({
          id: userId,
          userName: profile.username,
          gamesPlayed: profile.games_played,
          gamesWon: profile.games_won,
          totalWordsTyped: profile.total_words_typed,
          bestWPM: profile.best_words_per_minute,
        });
      } catch (error) {
        console.error("Unexpected error fetching user info:", error.message);
      }
    };

    getUserInfo();
  }, []);

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!userInfo) return;

      try {
        const { data: gamePlayerData, error: gameError } = await supabase
          .from("game_players")
          .select("*")
          .eq("player_id", userInfo.id)
          .single();
        console.log("Game details fetched:", gamePlayerData);
        setGameId(gamePlayerData.game_id);
      } catch (error) {
        console.error("Error fetching game details:", error.message);
      }
    };

    fetchGameDetails();
  }, [userInfo]); // Runs whenever `userInfo` changes

  // fetch plays and subscription code occurs here
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!gameId) return; // Wait for gameId to load

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
            userName: player.username,
            status: player.status,
          }))
        );
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();

    // Set up subscription for real-time updates
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
        () => {
          console.log("Change detected, refreshing players list.");
          fetchPlayers(); // Re-fetch players on any change
        }
      )
      .subscribe((status) => {
        console.log("Player subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  useEffect(() => {
    const updatePlayerStatus = async () => {
      if (!gameId || percentComplete === null) return; // Ensure gameId is available and percentComplete is valid

      try {
        const { error } = await supabase
          .from("game_players")
          .update({ status: percentComplete }) // Update status to match percentComplete
          .eq("game_id", gameId)
          .eq("player_id", userInfo.id); // Use the current player's ID

        if (error) {
          throw new Error(error.message);
        }

        console.log(`Player status updated to ${percentComplete}%`);
      } catch (error) {
        console.error("Error updating player status:", error);
      }
    };

    const checkForWin = async () => {
      if (!gameId || percentComplete === null) return; // Ensure gameId is available and percentComplete is valid
      if (percentComplete !== 100) return; // Only check for win if the player has completed the prompt (100%)

      try {
        const { data: gameWin, error: gameWinError } = await supabase
          .from("games")
          .select("winner")
          .eq("id", gameId)
          .single();
        console.log("Game win data:", gameWin);
      } catch (error) {
        console.error("Error checking for win:", error);
      }

      try {
        const { error } = await supabase
          .from("game_players")
          .update({ status: percentComplete }) // Update status to match percentComplete
          .eq("game_id", gameId)
          .eq("player_id", userInfo.id); // Use the current player's ID

        if (error) {
          throw new Error(error.message);
        }

        console.log(`Player status updated to ${percentComplete}%`);
      } catch (error) {
        console.error("Error updating player status:", error);
      }
    };

    updatePlayerStatus();
  }, [percentComplete, gameId]); // Run whenever percentComplete or gameId changes
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
        <h1>
          F1Racer, <span>{userInfo.userName}</span>, playing in
          {gameName}
          <span id="gameServerName"></span>
          <span id="endOfGameMessage"></span>
        </h1>
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
    </div>
  );
}

export default GamingPage;
