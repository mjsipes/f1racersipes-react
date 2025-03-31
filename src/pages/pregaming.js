import React from "react";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

function Pregaming() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function getUser() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    setUser(authData.user);
    console.log("authData: ", authData);
    if (authError) {
      console.log("authError: ", authError);
      alert(authError);
    }
  }

  async function getUserProfile(user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);
    console.log("profile: ", profile);
    if (profileError) {
      console.log("profileError: ", profileError);
      alert(profileError);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile(user);
    }
  }, [user]);

  return (
    <div className="container" style={{ 
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      border: "none"
    }}>
      <header className="header" style={{
        background: "linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)",
        margin: "-20px -20px 20px -20px",
        padding: "20px",
        borderRadius: "8px 8px 0 0",
        color: "white"
      }}>
        <img
          src="F1RacerLogo.png"
          alt="F1 Racer Logo"
          className="f1racerlogosmall"
          style={{ height: "60px", marginRight: "20px", filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))" }}
        />
        <h2 style={{ color: "white", fontWeight: "700", textShadow: "0px 2px 3px rgba(0,0,0,0.2)" }}>
          {"PREPARE TO RACE "}
          {user?.user_metadata?.userName && (
            <span style={{ color: "#fff" }}>{user.user_metadata.userName.toUpperCase()}</span>
          )}
        </h2>
      </header>
      {userProfile && (
        <section style={{ 
          width: "100%", 
          margin: "15px auto", 
          background: "linear-gradient(135deg, #f6f8f9 0%, #e9edf0 100%)",
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "1px solid rgba(231, 76, 60, 0.3)"
        }}>
          <div style={{ 
            background: "linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)", 
            padding: "12px 20px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            color: "white"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>DRIVER STATISTICS</div>
            <div style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.2)", 
              padding: "4px 12px", 
              borderRadius: "20px", 
              fontSize: "14px",
              fontWeight: "bold" 
            }}>
              {user?.user_metadata?.userName || "Racer"}
            </div>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-around", 
            padding: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.7)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>RACES</div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>{userProfile.gamesPlayed}</div>
            </div>
            
            <div style={{ width: "1px", background: "linear-gradient(to bottom, transparent, #e74c3c 20%, #e74c3c 80%, transparent)" }}></div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>VICTORIES</div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>{userProfile.gamesWon}</div>
            </div>
            
            <div style={{ width: "1px", background: "linear-gradient(to bottom, transparent, #e74c3c 20%, #e74c3c 80%, transparent)" }}></div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>WORDS</div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>{userProfile.totalWordsTyped}</div>
            </div>
            
            <div style={{ width: "1px", background: "linear-gradient(to bottom, transparent, #e74c3c 20%, #e74c3c 80%, transparent)" }}></div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>TOP SPEED</div>
              <div style={{ fontSize: "28px", fontWeight: "bold" }}>{userProfile.bestWpm} <span style={{ fontSize: "14px" }}>WPM</span></div>
            </div>
          </div>
        </section>
      )}

      <img
        src="/Racetrack.png"
        alt="this is the racetrack"
        className="racetrack-image"
      />

      <div className="buttons" style={{ marginTop: "25px" }}>
        <button
          className="button"
          style={{
            background: "linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "14px 0",
            border: "none",
            boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
            transition: "all 0.3s ease",
            transform: "translateY(0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          onClick={() => (window.location.href = "/startgame")}
        >
          <span style={{ marginRight: "8px" }}>🏁</span> START RACE
        </button>
        <button
          className="button"
          style={{
            background: "linear-gradient(90deg, #2c3e50 0%, #34495e 100%)",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "14px 0",
            border: "none",
            boxShadow: "0 4px 12px rgba(44, 62, 80, 0.3)",
            transition: "all 0.3s ease",
            transform: "translateY(0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          onClick={() => (window.location.href = "/joingame")}
        >
          <span style={{ marginRight: "8px" }}>🏎️</span> JOIN RACE
        </button>
      </div>
    </div>
  );
}

export default Pregaming;
