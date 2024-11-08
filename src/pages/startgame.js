import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import "../styles/startgame.css";

function StartGame() {
  const [gameServerName, setgameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [customTopic, setCustomTopic] = useState("");
  const [message, setMessage] = useState("");
  const [gameId, setGameId] = useState(null); // Add state to store the game ID

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You must be logged in to create a game.");
        return;
      }

      const { data: game, error: createError } = await supabase
        .from("games")
        .insert([
          {
            prompt: customTopic || "Random Prompt",
            created_by: user.id,
            state: "waiting",
            game_name: gameServerName,
          },
        ])
        .select()
        .single();

      if (createError) {
        throw new Error("Failed to create game: " + createError.message);
      }

      // Store the game ID in state for use in the useEffect hook
      setGameId(game.id);

      const { error: joinError } = await supabase.from("game_players").insert([
        {
          game_id: game.id,
          player_id: user.id,
          status: 0,
        },
      ]);

      if (joinError) {
        throw new Error("Failed to join game: " + joinError.message);
      }

      const channel = supabase.channel(`game-${game.id}`);

      channel
        .on("broadcast", { event: "status-update" }, (payload) => {
          console.log("Player status update received!", payload);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            channel.send({
              type: "broadcast",
              event: "status-update",
              payload: { player_id: user.id, status: "playing" },
            });
          }
        });

      window.location.href = `/game`;
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (gameId) {
      const joinGameChannel = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const channel = supabase.channel(`game-${gameId}`);

        channel
          .on("broadcast", { event: "status-update" }, (payload) => {
            console.log("Received player status:", payload);
          })
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              channel.send({
                type: "broadcast",
                event: "status-update",
                payload: { player_id: user.id, status: "joined" },
              });
            }
          });
      };

      joinGameChannel();
    }
  }, [gameId]); // Run this effect when gameId changes

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
