import React, { useState, useEffect } from "react";
import "../styles/joingame.css"; // Update with your CSS file path

function JoinGame() {
  const [gameServerName, setGameServerName] = useState("");
  const [games, setGames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = () => {
    // Replace AJAX fetch with a simple "Hello World" response
    const helloWorldResponse = [{ serverName: "Hello World" }];
    setGames(helloWorldResponse);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
