// hooks/useJoinGame.js
import { useState } from "react";
import supabase from "../supabaseClient";

const useJoinGame = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const joinGame = async (selectedGameId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to join a game.");
        return;
      }

      // Remove any existing entry for this player in game_players
      const { error: deleteError } = await supabase
        .from("game_players")
        .delete()
        .eq("player_id", user.id);

      if (deleteError) {
        throw new Error(
          "Failed to remove existing game entry: " + deleteError.message
        );
      }

      // Insert the player into the game_players table for the selected game
      const { error: joinError } = await supabase.from("game_players").insert([
        {
          game_id: selectedGameId,
          player_id: user.id,
          status: 0, // Player is currently playing
          username: user.email,
        },
      ]);

      if (joinError) {
        throw new Error("Failed to join game: " + joinError.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
    }
  };

  return { joinGame, errorMessage };
};

export default useJoinGame;
