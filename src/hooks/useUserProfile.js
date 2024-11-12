import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null); // Renamed from user to userProfile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError) throw new Error(authError.message);

        const userId = authData?.user?.id;
        if (!userId) throw new Error("User ID not found.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError || !profile) {
          throw new Error(profileError?.message || "Profile not found.");
        }

        setUserProfile(profile); // Set userProfile with profile data
        setError(null); // Clear any previous error
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  return { userProfile, loading, error }; // Return userProfile instead of user
};

export default useUserProfile;
