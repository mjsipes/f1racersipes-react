import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import useJoinGame from "../hooks/useJoinGame";
import "../styles/joingame.css";

function JoinGame() {
  const [games, setGames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { joinGame, errorMessage: joinErrorMessage } = useJoinGame();

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

  const handleJoinGame = async (gameId) => {
    await joinGame(gameId);
    window.location.href = `/game`; // Redirect to the gaming page after joining
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h2>Join a Race</h2>
      </div>
      {(errorMessage || joinErrorMessage) && (
        <p className="error-message">{errorMessage || joinErrorMessage}</p>
      )}
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
                <th>Game Name</th>
                <th>ID</th>
                <th>Created At</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr
                  key={game.id}
                  onClick={() => handleJoinGame(game.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{game.game_name}</td>
                  <td>{game.id}</td>
                  <td>{game.created_at}</td>
                  <td>{game.winner}</td>
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
