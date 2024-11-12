import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
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

        setUserProfile(profile);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  return { userProfile, loading, error };
};

export default useUserProfile;
