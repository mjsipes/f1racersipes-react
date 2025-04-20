// utils/joinGame.js
import supabase from "../supabaseClient";

async function joinGame(selectedGameId) {
  let user;
  console.log("joinGame: selectedGameId= ", selectedGameId);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  console.log("authData: ", authData);
  user = authData.user;
  if (authError) {
    console.log("authError: ", authError);
    return;
  }

  // Remove any existing entry for this player in game_players
  const { error: deleteError } = await supabase
    .from("game_players")
    .delete()
    .eq("player_id", user.id);
  console.log("deleteError: ", deleteError);

  // Insert the player into the game_players table for the selected game
  const { data: joinData, error: joinError } = await supabase
    .from("game_players")
    .insert([
      {
        game_id: selectedGameId,
        player_id: user.id,
        status: 0,
        username: user.user_metadata.full_name,
      },
    ]);
  console.log("joinData: ", joinData);
  console.log("joinError: ", joinError);
}

export default joinGame;
