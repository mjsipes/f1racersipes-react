import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient"; // Import your Supabase client
import "../styles/joingame.css";

function JoinGame() {
  const [id, setGameServerName] = useState("");
  const [games, setGames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchGames = async () => {
    try {
      const { data: gamesList, error } = await supabase
        .from("games")
        .select("*")
        .eq("state", "waiting");

      if (error) {
        throw new Error("Failed to fetch game servers.");
      }

      setGames(gamesList);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while fetching the game servers.");
    }
  };

  useEffect(() => {
    fetchGames();

    const subscription = supabase
      .channel("games")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        () => {
          console.log("Change detected, refreshing games list.");
          fetchGames();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to join a game.");
        return;
      }

      // Find the selected game by its name
      const selectedGame = games.find((game) => game.id === id);
      if (!selectedGame) {
        setErrorMessage("Game server not found.");
        return;
      }

      // Insert the player into the game_players table
      const { error: joinError } = await supabase.from("game_players").insert([
        {
          game_id: selectedGame.id,
          player_id: user.id,
          status: "playing", // Player is currently playing
        },
      ]);

      if (joinError) {
        throw new Error("Failed to join game: " + joinError.message);
      }

      // Redirect to the game page
      window.location.href = `/game`;
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h2>Join a Race</h2>
      </div>
      <form id="gameServerForm" onSubmit={handleSubmit}>
        <label htmlFor="gameServerInput">Game Server Name</label>
        <input
          type="text"
          id="gameServerInput"
          name="gameServerid"
          placeholder="Enter the id of a game server below to join."
          value={id}
          onChange={(e) => setGameServerName(e.target.value)}
          required
        />
        <button type="submit" className="button">
          Join Game
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <span id="gameServerNote">
        {games.length === 0
          ? "No games yet!"
          : "Below are all the current games. Enter the name of the game server you would like to join!"}
      </span>
      <span id="gameServerTable">
        {games.length > 0 && (
          <table>
            <thead>
              <tr>
                {Object.keys(games[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => (
                <tr key={index}>
                  {Object.values(game).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </span>
    </div>
  );
}

export default JoinGame;
