import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import joinGame from "../utils/joinGame";
import Header from "../components/Header";

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
      .neq("state", "finished");
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
    <>
      <Header />
      <div className="container-w-nav">
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
                  <th>Status</th>
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
                    <td>{game.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </span>
      </div>
    </>
  );
}

export default JoinGame;
