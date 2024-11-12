// hooks/useJoinGame.js
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const useJoinGame = () => {
  const [games, setGames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available games
  const fetchGames = async () => {
    try {
      const { data: gamesList, error } = await supabase
        .from("games")
        .select("*")
        .eq("state", "waiting");

      if (error) throw new Error("Failed to fetch game servers.");
      setGames(gamesList);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while fetching the game servers.");
    }
  };

  // Subscribe to game updates
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
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Join game handler
  const joinGame = async (selectedGameId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to join a game.");
        return;
      }

      // Remove existing player entry if it exists
      const { error: deleteError } = await supabase
        .from("game_players")
        .delete()
        .eq("player_id", user.id);

      if (deleteError) {
        throw new Error(
          "Failed to remove existing game entry: " + deleteError.message
        );
      }

      // Insert the player into the game_players table
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

      // Redirect to the game page
      window.location.href = `/game`;
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message);
    }
  };

  return { games, errorMessage, joinGame };
};

export default useJoinGame;
