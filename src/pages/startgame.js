import React, { useState } from "react";
import supabase from "../supabaseClient";
import joinGame from "../utils/joinGame";
import Header from "../components/Header";

function StartGame() {
  const [gameServerName, setGameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [custom_topic, setcustom_topic] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const { data: game, error: insertError } = await supabase
      .from("games")
      .insert([
        {
          custom_topic: custom_topic,
          difficulty: difficulty,
          state: "waiting",
          game_name: gameServerName,
        },
      ])
      .select()
      .single();
    if (insertError) {
      console.log(insertError, insertError);
      alert("insertError" + insertError.message);
      return;
    }
    console.log("game: ", game);
    await joinGame(game.id);
    window.location.href = `/game`;
  }

  return (
    <>
      <Header />
      <div className="container-w-nav">
        <div className="header">
          <img
            src="F1RacerLogo.png"
            alt="this is the logo"
            className="f1racerlogosmall"
          />
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

          <label htmlFor="custom_topic">Prompt Type</label>
          <input
            type="text"
            id="custom_topic"
            name="custom_topic"
            className="topic-box"
            placeholder="Enter custom topic. Leave blank to default to random."
            value={custom_topic}
            onChange={(e) => setcustom_topic(e.target.value)}
          />
          <button type="submit" className="button">
            Start Game
          </button>
        </form>
      </div>
    </>
  );
}

export default StartGame;
