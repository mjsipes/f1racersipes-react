import React, { useState, useEffect } from "react";
import "../styles/joingame.css";

function JoinGame() {
  const [gameServerName, setGameServerName] = useState("");
  const [games, setGames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3001/get-games", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch game servers.");
      }
      const gameServerList = await response.json();
      setGames(gameServerList);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while fetching the game servers.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const username = localStorage.getItem("username");
      const response = await fetch("http://localhost:3001/join-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, gameServerName }),
      });
      if (!response.ok) {
        throw new Error("Failed to join game server.");
      }
      window.location.href = `/game`;
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while joining the game server.");
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
          name="gameServerName"
          placeholder="Enter the name of a game server below to join."
          value={gameServerName}
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
