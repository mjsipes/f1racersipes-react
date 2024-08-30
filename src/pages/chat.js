import React, { useState, useEffect } from "react";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3001");
    websocket.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // If the message is a Blob, read it as text
        const reader = new FileReader();
        reader.onload = () => {
          setMessages((prev) => [...prev, reader.result]);
        };
        reader.readAsText(event.data);
      } else {
        // If it's not a Blob, handle it as a string directly
        setMessages((prev) => [...prev, event.data]);
      }
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input.trim()) {
      ws.send(input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => (e.key === "Enter" ? sendMessage() : null)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
