import React, { useState } from "react";
import "../styles/startgame.css";

function StartGame() {
  const [gameServerName, setgameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [customTopic, setCustomTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/create-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameServerName, difficulty, customTopic }),
      });
      if (!response.ok) {
        throw new Error("Failed to join game server.");
      }
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
        setMessage("An error occurred while joining the game server.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while creating the game server.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h2>Set Up Your Race</h2>
      </div>
      <form id="startGameForm" onSubmit={handleSubmit}>
        <label htmlFor="gameServerName">Game Server Name</label>
        <input
          type="text"
          id="gameServerName"
          name="gameServerName"
          className="topic-box"
          placeholder="Enter name for your game server"
          value={gameServerName}
          onChange={(e) => setgameServerName(e.target.value)}
          required
        />

        <label htmlFor="difficulty">Difficulty Level (1-10)</label>
        <input
          type="range"
          id="difficulty"
          name="difficulty"
          min="1"
          max="10"
          className="slider"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />

        <label htmlFor="customTopic">Prompt Type</label>
        <input
          type="text"
          id="customTopic"
          name="customTopic"
          className="topic-box"
          placeholder="Enter custom topic. Leave blank to default to random."
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
        />

        <button type="submit" className="button">
          Start Game
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default StartGame;
