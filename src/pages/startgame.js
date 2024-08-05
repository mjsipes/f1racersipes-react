import React, { useState } from "react";
import "../styles/startgame.css";

function StartGame() {
  const [gameServerName, setGameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [customTopic, setCustomTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requestBody = {
      gameServerName,
      difficulty,
      customTopic,
    };

    try {
      const response = await fetch("/create-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.status === "success") {
        setMessage("Game server created successfully!");
        // Optionally redirect to the game page or update the UI
        window.location.href = `/game/${gameServerName}`;
      } else {
        setMessage("Failed to create game server: " + result.message);
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
          onChange={(e) => setGameServerName(e.target.value)}
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
