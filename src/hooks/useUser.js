import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
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

        // Set the user state dynamically to include all profile properties
        setUser(profile);
        setError(null); // Clear any previous error
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return { user, loading, error };
};
