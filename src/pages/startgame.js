import React, { useState } from "react";
import supabase from "../supabaseClient";
import useJoinGame from "../hooks/useJoinGame";
import "../styles/startgame.css";

function StartGame() {
  const [gameServerName, setGameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [customTopic, setCustomTopic] = useState("");
  const [message, setMessage] = useState("");

  const { joinGame, errorMessage } = useJoinGame();

  async function handleSubmit(event) {
    event.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in to create a game.");
      return;
    }
    const { data: game, error: insertError } = await supabase
      .from("games")
      .insert([
        {
          customTopic: customTopic,
          difficulty: difficulty,
          state: "waiting",
          game_name: gameServerName,
        },
      ])
      .select()
      .single();
      console.log("game: ", game);
      if (insertError) {
        setMessage("Failed to create game: " + insertError.message);
        return;
      }
    await joinGame(game.id);
    window.location.href = `/game`;
  }

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
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default StartGame;
