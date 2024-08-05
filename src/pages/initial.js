import React, { useState } from "react";
import "../styles/initial.css";

function Initial() {
  const [showModal, setShowModal] = useState(false);

  const handlePlayAsGuest = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const redirectTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="wrapper">
      <div id="top">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" className="logo" />
        <h1>Welcome to F1 Racer</h1>
        <p>
          Experience the thrill of racing and typing as you compete against
          others or against the clock. Will you cross the finish line first?
        </p>
        <div>
          <button className="button" onClick={() => redirectTo("/login")}>
            Log In
          </button>
          <button className="button" onClick={() => redirectTo("/signup")}>
            Register
          </button>
          <button
            className="button button-play-guest"
            onClick={handlePlayAsGuest}
          >
            Play as Guest
          </button>
        </div>
      </div>

      {showModal && (
        <div id="guestModal" className="modal">
          <div className="modal-content">
            <p>When you play as a guest, your information will not be saved.</p>
            <button className="modal-button" onClick={closeModal}>
              Go Back
            </button>
            <button
              className="modal-button"
              onClick={() => redirectTo("/pregaming")}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Initial;
