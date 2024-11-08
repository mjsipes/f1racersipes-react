import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient"; // Import your Supabase client
import "../styles/joingame.css";

function JoinGame() {
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

  const handleSubmit = async (selectedGameId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to join a game.");
        return;
      }

      // Find the selected game by its ID
      const selectedGame = games.find((game) => game.id === selectedGameId);
      if (!selectedGame) {
        setErrorMessage("Game server not found.");
        return;
      }

      // Insert the player into the game_players table
      const { error: joinError } = await supabase.from("game_players").insert([
        {
          game_id: selectedGame.id,
          player_id: user.id,
          status: 0, // Player is currently playing
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
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <span id="gameServerNote">
        {games.length === 0
          ? "No games yet!"
          : "Click on a game row below to join!"}
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
              {games.map((game) => (
                <tr
                  key={game.id}
                  onClick={() => handleSubmit(game.id)}
                  style={{ cursor: "pointer" }}
                >
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
