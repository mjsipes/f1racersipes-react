import React, { useState, useEffect, useRef } from "react";
import "../styles/gamingpage.css";

function GamingPage() {
  const [socket, setSocket] = useState(null);
  const [gameStart, setGameStart] = useState(false);
  const [gameStop, setGameStop] = useState(false);
  const [prompt, setPrompt] = useState(""); // Initial prompt state

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

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Use refs for other state values that require preservation across renders
  const typingInputRef = useRef(null);

  useEffect(() => {
    const newSocket = new WebSocket(
      "ws://localhost:3000/f1racer2/GamingPageWebSocket"
    );
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    newSocket.onmessage = handleSocketMessage;

    newSocket.onclose = () => {
      console.log("Disconnected!");
    };

    // Clean up the socket connection when component unmounts
    return () => {
      newSocket.close();
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleSocketMessage = (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case "carPosition":
        // updateCarPosition(msg.value);
        // updateCarPositionOmar(msg.value);
        break;
      case "gameStop":
        setGameStop(msg.value);
        updateIsWinnerOrLoser();
        break;
      case "gameStart":
        setGameStart(msg.value);
        break;
      case "gameServerName":
        document.getElementById("gameServerName").innerText = msg.value;
        break;
      case "userName":
        document.getElementById("userName").innerText = msg.value;
        break;
      case "prompt":
        setPrompt(msg.value);
        break;
      default:
        console.error("Unknown message type:", msg.type);
    }
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
    if (socket) {
      const jsonMessage = JSON.stringify({ type, value });
      socket.send(jsonMessage);
      console.log("Sending:", jsonMessage);
    }
  };

  return (
    <div className="wrapper">
      <div className="header">
        <img src="/F1RacerLogo.png" alt="F1 Racer Logo" />
        <h1>
          F1Racer, <span id="userName"></span>, playing in{" "}
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
