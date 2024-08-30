import React, { useState, useEffect, useRef } from "react";
import "../styles/gamingpage.css";

function GamingPage() {
  //game state
  const [gameStart, setGameStart] = useState(false);
  const [gameStop, setGameStop] = useState(false);
  const [prompt, setPrompt] = useState("wefwefwfw"); // Initial prompt state

  // Player state
  const [response, setResponse] = useState("");
  const [numErrors, setNumErrors] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Player stats
  const [accuracy, setAccuracy] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [numCharactersTyped, setNumCharactersTyped] = useState(0);
  const [CPM, setCPM] = useState(0);

  const [ws, setWs] = useState(null);
  const username = localStorage.getItem("username");

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Use refs for other state values that require preservation across renders
  const typingInputRef = useRef(null);

  useEffect(() => {
    console.log("gamingpage.js: Connecting to Websocket server...");
    const websocket = new WebSocket(`ws://localhost:3001?username=${username}`);
    setWs(websocket);
    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };
    websocket.onmessage = handleSocketMessage;
    websocket.onclose = () => {
      console.log("Disconnected!");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleSocketMessage = (event) => {
    console.log("Received message from WebSocket server:", event.data);
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (error) {
      console.error("Failed to parse WebSocket message as JSON:", error);
      return;
    }
    if (!msg.type) {
      console.error("Message type is missing:", msg);
      return;
    }
    switch (msg.type) {
      case "carPosition":
        handleCarPosition(msg.value);
        break;
      case "gameStop":
        handleGameStop(msg.value);
        break;
      case "gameStart":
        handleGameStart(msg.value);
        break;
      case "gameServerName":
        updateGameServerName(msg.value);
        break;
      case "username":
        updateusername(msg.value);
        break;
      case "prompt":
        handlePrompt(msg.value);
        break;
      default:
        console.error("Unknown message type:", msg.type);
    }
  };

  const handleCarPosition = (value) => {
    updateCarPosition(value);
  };

  const handleGameStop = (value) => {
    setGameStop(value);
    updateIsWinnerOrLoser();
  };

  const handleGameStart = (value) => {
    setGameStart(value);
  };

  const updateGameServerName = (value) => {
    document.getElementById("gameServerName").innerText = value;
  };

  const updateusername = (value) => {
    document.getElementById("username").innerText = value;
  };

  const handlePrompt = (value) => {
    setPrompt(value);
  };

  const handleTypingInput = (event) => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(updateTimer, 1000);
    }

    const newResponse = event.target.value;
    setResponse(newResponse);
    setNumCharactersTyped(newResponse.length);

    updateIsError(newResponse);
    updateAccuracy(newResponse.length);
    updateCPM();
    updatePercentComplete(newResponse);
    updateIsWinnerOrLoser();
  };

  const updateTimer = () => {
    const elapsed = (new Date() - startTimeRef.current) / 1000; // Time in seconds
    setTimeElapsed(elapsed.toFixed(0));
    updateCPM();
  };

  const updateIsError = (newResponse) => {
    const error = !prompt.startsWith(newResponse);
    setIsError(error);
    if (error && newResponse.length > 0) {
      setNumErrors((prevErrors) => prevErrors + 1);
    }
  };

  const updateAccuracy = (charactersTyped) => {
    const accuracyValue = 1 - numErrors / charactersTyped;
    setAccuracy(accuracyValue);
  };

  const updateCPM = () => {
    const minutesElapsed = (new Date() - startTimeRef.current) / 1000 / 60;
    const newCPM =
      minutesElapsed > 0 ? (numCharactersTyped / minutesElapsed).toFixed(2) : 0;
    setCPM(newCPM);
  };

  function updateCarPosition(value) {
    try {
      const data = JSON.parse(value); // Parse the JSON data
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format, expected an array.");
      }
      let table = `<table border="1"><tr><th>Player Name</th><th>Game Status</th></tr>`;

      // Iterate over the data to create table rows
      data.forEach((item) => {
        table += `<tr><td>${item.serverName || "Unknown"}</td><td>${
          item.gameStatus || "Unknown"
        }</td></tr>`;
      });

      table += "</table>";
      // Safely update the inner HTML of the element
      const carPositionElement = document.getElementById("carPosition");
      if (carPositionElement) {
        carPositionElement.innerHTML = table;
      } else {
        console.error("Element with id 'carPosition' not found.");
      }
    } catch (error) {
      console.error("Failed to update car position:", error.message);
    }
  }

  const updatePercentComplete = (newResponse) => {
    if (!isError) {
      const completion = ((newResponse.length / prompt.length) * 100).toFixed(
        2
      );
      setPercentComplete(completion);
      send("percentComplete", completion);
    }
  };

  const updateIsWinnerOrLoser = () => {
    if (gameStart && !gameStop) {
      if (parseInt(percentComplete, 10) === 100) {
        setIsWinner(true);
        document.getElementById("endOfGameMessage").textContent = "You win :)";
        send("isWinner", true);
      }
    } else if (gameStart && gameStop && !isWinner) {
      document.getElementById("endOfGameMessage").textContent = "You lose :(";
    }
  };

  const send = (type, value) => {
    if (ws) {
      const jsonMessage = JSON.stringify({ type, value });
      ws.send(jsonMessage);
      console.log("Sending:", jsonMessage);
    }
  };

  return (
    <div className="wrapper">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h1>
          F1Racer, <span id="username"></span>, playing in{" "}
          <span id="gameServerName"></span>
          <span id="endOfGameMessage"></span>
        </h1>
      </div>

      <h1 className="game-stats">
        Game Statistics:{" "}
        <span id="numCharactersTyped">{numCharactersTyped}</span> characters
        typed.
        <span id="CPM">{CPM}</span> CPM.{" "}
        <span id="isError">{isError.toString()}</span> = isError.
        <span id="timer">{timeElapsed}</span> seconds.{" "}
        <span id="percentComplete">{percentComplete}</span>% complete.
      </h1>

      <span id="carPosition"></span>

      <p>
        Prompt: <span id="prompt">{prompt}</span>
      </p>

      <br />
      <input
        type="text"
        id="typingInput"
        placeholder="Start typing..."
        ref={typingInputRef}
        onInput={handleTypingInput}
      />
      <br />
      <div id="response">{response}</div>

      <a href="/pregaming" className="button">
        Exit Game
      </a>
    </div>
  );
}

export default GamingPage;
