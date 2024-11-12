import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import useJoinGame from "../hooks/useJoinGame"; // Import the hook
import "../styles/startgame.css";

function StartGame() {
  const [gameServerName, setgameServerName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [customTopic, setCustomTopic] = useState("");
  const [message, setMessage] = useState("");
  const [gameId, setGameId] = useState(null);

  const { joinGame, errorMessage } = useJoinGame(); // Destructure the hook

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
            state: "waiting",
            game_name: gameServerName,
          },
        ])
        .select()
        .single();

      if (createError) {
        throw new Error("Failed to create game: " + createError.message);
      }

      // Set the game ID after creation
      setGameId(game.id);

      // Call joinGame from the hook to add the player to the game
      await joinGame(game.id);

      // Redirect to the game page
      window.location.href = `/game`;
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (gameId) {
      const setupChannel = async () => {
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

      setupChannel();
    }
  }, [gameId]);

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
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default StartGame;
