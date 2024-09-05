import React, { useState } from "react";
import "../styles/global.css";

// Reusable Button Component
const Button = ({ className, onClick, children }) => (
  <button className={className} onClick={onClick}>
    {children}
  </button>
);

// Reusable Modal Component
const Modal = ({ onClose, onContinue }) => (
  <div id="guestModal" className="modal">
    <div className="modal-content">
      <p>When you play as a guest, your information will not be saved.</p>
      <Button className="modal-button" onClick={onClose}>
        Go Back
      </Button>
      <Button className="modal-button" onClick={onContinue}>
        Continue
      </Button>
    </div>
  </div>
);

function Initial() {
  const [showModal, setShowModal] = useState(false);

  const handlePlayAsGuest = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  const redirectTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="container">
      <h2>Welcome to F1 Racer</h2>
      <img src="/F1RacerLogo.png" alt="F1 Racer Logo" className="logo" />
      <p>
        Experience the thrill of racing and typing as you compete against others
        or against the clock. Will you cross the finish line first?
      </p>
      <div className="button-group">
        <Button className="button" onClick={() => redirectTo("/login")}>
          Log In
        </Button>
        <Button className="button" onClick={() => redirectTo("/signup")}>
          Register
        </Button>
        <Button
          className="button button-play-guest"
          onClick={handlePlayAsGuest}
        >
          Play as Guest
        </Button>
      </div>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onContinue={() => redirectTo("/pregaming")}
        />
      )}
    </div>
  );
}

export default Initial;
