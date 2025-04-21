import supabase from "../supabaseClient";

async function updatePlayerProfile(gameData, user, numWordsTyped, WPM) {
  if (!user) return;
  let isWinner;
  if (gameData.winner == user.id) {
    isWinner = true;
  } else {
    isWinner = false;
  }

  const roundedWPM = Math.floor(parseFloat(WPM));

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("games_played, gamesWon, total_words_typed")
    .eq("id", user.id)
    .single();
  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
    return;
  }

  const { data: updateData, error: updateError } = await supabase
    .from("profiles")
    .update({
      games_played: (profileData.games_played || 0) + 1,
      gamesWon: isWinner
        ? (profileData.gamesWon || 0) + 1
        : profileData.gamesWon || 0,
      total_words_typed: (profileData.total_words_typed || 0) + numWordsTyped,
      best_wpm:
        !profileData.best_wpm || roundedWPM > profileData.best_wpm
          ? roundedWPM
          : profileData.best_wpm,
    })
    .eq("id", user.id);
  if (updateError) {
    console.error("updateError:", updateError.message);
  } else {
    console.log("updateData", updateData);
  }
}

export default updatePlayerProfile;
