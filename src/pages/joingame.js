import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import joinGame from "../utils/joinGame";

function JoinGame() {
  const [games, setGames] = useState([]);

  async function handleJoinGame(gameId) {
    await joinGame(gameId);
    window.location.href = `/game`;
  }

  //----------------------------------------------------------------------------
  async function fetchGames() {
    const { data: selectGames, error: selectGamesError } = await supabase
      .from("games")
      .select("*")
      .eq("state", "waiting");
    if (selectGamesError) {
      console.log("selectGamesError: ", selectGamesError);
      alert("selectGamesError: ", selectGamesError);
      return;
    }
    console.log("selectGames: ", selectGames);
    setGames(selectGames);
  }
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
  //----------------------------------------------------------------------------

  return (
    <div className="container">
      <div className="header">
        <img
          src="/F1RacerLogo.png"
          alt="this is the logo"
          className="f1racerlogosmall"
        />
        <h2>Join a Race</h2>
      </div>
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
